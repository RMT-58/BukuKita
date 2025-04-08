import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gql } from "@apollo/client";
import client from "../config/apollo";

const FIND_BOOK_BY_ID = gql`
  query FindBookById($findBookByIdId: ID!) {
    findBookById(id: $findBookByIdId) {
      _id
      title
      author
      genres
      synopsis
      cover_type
      condition
      condition_details
      thumbnail_url
      image_urls
      status
      price
      uploader_id
      uploaded_by {
        _id
        name
        username
        phone_number
        address
        created_at
        updated_at
      }
      created_at
      updated_at
    }
  }
`;

const CREATE_RENTAL = gql`
  mutation CreateRental($input: CreateRentalInput!) {
    createRental(input: $input) {
      _id
      user_id
      total_amount
      status
      payment_method
      paid_date
      created_at
      updated_at
      token
      redirect_url
      details {
        _id
        book_id
        price
        period
        total
        title
        author
        genres
        synopsis
        cover_type
        thumbnail_url
        image_urls
        rental_id
        rental_start
        rental_end
        created_at
        updated_at
      }
    }
  }
`;

const CREATE_RENTAL_DETAIL = gql`
  mutation CreateRentalDetail($input: CreateRentalDetailInput!) {
    createRentalDetail(input: $input) {
      _id
      book_id
      price
      period
      total
      title
      author
      genres
      synopsis
      cover_type
      thumbnail_url
      image_urls
      rental_id
      rental_start
      rental_end
      created_at
      updated_at
    }
  }
`;
//bikin initialstate
const initialState = {
  items: [],
  bookDetails: [],
  loading: false,
  error: null,
  serviceFee: 500,
  detailsFetched: false,
};

// buat Zustand store dengan persistance
export const useCartStore = create(
  persist(
    (set, get) => ({
      // State (pake initial state)
      ...initialState,

      // Actions
      addToCart: (bookId) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (item) => item._id === bookId
        );

        // ambil tanggal besok sebagai default start date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultStartDate = tomorrow.toISOString().split("T")[0];

        if (existingItemIndex !== -1) {
          // jika item sudah ada di cart, tambahkan periode
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            period: updatedItems[existingItemIndex].period + 1,
          };
          set({ items: updatedItems, detailsFetched: false });
        } else {
          // kalau belum add to cart dengan periode 1
          set({
            items: [
              ...items,
              { _id: bookId, period: 1, startDate: defaultStartDate },
            ],
            detailsFetched: false,
          });
        }
      },

      removeFromCart: (bookId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item._id !== bookId),
          detailsFetched: false,
        });
      },

      updatePeriod: (bookId, period = 1) => {
        const { items } = get();

        const updatedItems = items.map((item) =>
          item._id === bookId ? { ...item, period: Math.max(1, period) } : item
        );

        // langsung update book details agar tetap tersinkronisasi
        const { bookDetails } = get();
        const updatedBookDetails = bookDetails.map((book) =>
          book._id === bookId ? { ...book, period: Math.max(1, period) } : book
        );

        set({
          items: updatedItems,
          bookDetails: updatedBookDetails,
        });
      },

      updateStartDate: (bookId, startDate) => {
        const { items } = get();

        // update item start date
        const updatedItems = items.map((item) =>
          item._id === bookId ? { ...item, startDate } : item
        );

        // Update bookDetails to menyamakan dengan start date
        const { bookDetails } = get();
        const updatedBookDetails = bookDetails.map((book) =>
          book._id === bookId ? { ...book, startDate } : book
        );

        set({
          items: updatedItems,
          bookDetails: updatedBookDetails,
        });
      },

      setLoading: (isLoading) => set({ loading: isLoading }),

      setError: (errorMessage) => set({ error: errorMessage }),

      setBookDetails: (details) => set({ bookDetails: details }),

      setDetailsFetched: (fetched) => set({ detailsFetched: fetched }),

      clearCart: () => {
        localStorage.removeItem("cart-storage");
        set(initialState);
      },

      // Fetch book details
      fetchBookDetails: async () => {
        const {
          items,
          detailsFetched,
          setLoading,
          setError,
          setBookDetails,
          setDetailsFetched,
        } = get();

        // kalau tidak ada item di cart, kembalikan array kosong
        if (items.length === 0) {
          setBookDetails([]);
          return [];
        }

        // kalau sudah fetch, kembalikan data yang sudah ada
        if (detailsFetched) {
          return get().bookDetails;
        }

        try {
          setLoading(true);

          const bookDetailsPromises = items.map(async (item) => {
            try {
              const { data } = await client.query({
                query: FIND_BOOK_BY_ID,
                variables: { findBookByIdId: item._id },
              });

              // gabungkan book details dengan  periode dan start date
              return {
                ...data.findBookById,
                period: item.period,
                startDate: item.startDate,
              };
            } catch (error) {
              console.error(`Error fetching book with ID ${item._id}:`, error);
              return null;
            }
          });

          const bookDetailsResults = await Promise.all(bookDetailsPromises);
          const validResults = bookDetailsResults.filter(
            (book) => book !== null
          );

          setBookDetails(validResults);
          setDetailsFetched(true);
          setLoading(false);

          return validResults;
        } catch (error) {
          setError(error.message);
          setLoading(false);
          throw error;
        }
      },

      // kalkulasi total amount
      calculateTotal: () => {
        const { bookDetails, serviceFee } = get();
        const subtotal = bookDetails.reduce(
          (total, book) => total + book.price * book.period,
          0
        );
        return subtotal + serviceFee;
      },

      // rental period berdasarkan start date
      calculateRentalPeriod: (startDate, daysPeriod) => {
        const startDateObj = new Date(startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDateObj.getDate() + daysPeriod * 7);

        return {
          start: startDateObj.toISOString(),
          end: endDate.toISOString(),
        };
      },

      // prosess checkout nanti tambahkan payment method midtrans
      checkout: async (userId) => {
        const {
          setLoading,
          setError,
          fetchBookDetails,
          bookDetails,
          detailsFetched,
          calculateTotal,
          calculateRentalPeriod,
          clearCart,
        } = get();

        try {
          setLoading(true);

          // 1. fetch semua buku details
          let bookDetailsForCheckout = bookDetails;
          if (!detailsFetched || bookDetailsForCheckout.length === 0) {
            bookDetailsForCheckout = await fetchBookDetails();
          }

          // 2. buat rental - without payment_method, will be set by webhook
          const rentalInput = {
            user_id: userId,
            total_amount: calculateTotal(),
            // No payment_method here, will be set by webhook
          };

          const { data: rentalData } = await client.mutate({
            mutation: CREATE_RENTAL,
            variables: { input: rentalInput },
          });

          const rentalId = rentalData.createRental._id;

          // 3. buat rental details setiap boko dengan periode dan start date
          const rentalDetailsPromises = bookDetailsForCheckout.map(
            async (book) => {
              const rentalPeriod = calculateRentalPeriod(
                book.startDate,
                book.period
              );
              console.log(book);

              const detailInput = {
                book_id: book._id,
                rental_id: rentalId,
                title: book.title,
                author: book.author,
                genres: book.genres,
                synopsis: book.synopsis,
                cover_type: book.cover_type,
                thumbnail_url: book.thumbnail_url,
                image_urls: book.image_urls,
                price: book.price,
                period: book.period,
                rental_start: rentalPeriod.start,
                rental_end: rentalPeriod.end,
              };

              return client.mutate({
                mutation: CREATE_RENTAL_DETAIL,
                variables: { input: detailInput },
              });
            }
          );

          await Promise.all(rentalDetailsPromises);

          // 4. kosongkan cart
          clearCart();
          setLoading(false);

          return rentalData.createRental;
        } catch (error) {
          setError(error.message);
          setLoading(false);
          throw error;
        }
      },

      // Helper untuk mendapatkan total item
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.period, 0);
      },
    }),
    {
      name: "cart-storage", // nama item di storage (must be unique)
      storage: createJSONStorage(() => localStorage), // custom storage , default ke localstorage
    }
  )
);
