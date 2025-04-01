// type Book {
//     id: Int!
//     title: String!
//     author: String!
//     genres: [String!]!
//     synopsis: String
//     cover_type: CoverType!
//     condition: Int!
//     condition_details: String
//     thumbnail_url: String
//     image_urls: [String!]!
//     status: BookStatus!
//     price: Int!
//     uploaded_by: User!
//     rental_details: [RentalDetail!]!
//     rental_payments: [Rental!]!
//     created_at: String!
//     updated_at: String!
//   }

//todo: buat contoh, nanti didelete
const books = [
  {
    id: 1,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genres: ["thriller", "mystery", "psychological"],
    synopsis:
      "A famous painter shoots her husband and then stops speaking. A therapist is determined to get her to talk.",
    cover_type: "hardcover",
    condition: 8,
    condition_details: "Slight wear on the corners, otherwise excellent.",
    //   thumbnail_url: "https://example.com/images/silent_patient_thumb.jpg",
    //   image_urls: [
    //     "https://example.com/images/silent_patient_1.jpg",
    //     "https://example.com/images/silent_patient_2.jpg"
    //   ],
    status: "forRent",
    price: 25000,
    //   uploaded_by: 101,
    created_at: new Date("2024-12-01T10:00:00Z"),
    updated_at: new Date("2025-03-30T12:00:00Z"),
  },
  {
    id: 2,
    title: "Educated",
    author: "Tara Westover",
    genres: ["memoir", "biography"],
    synopsis:
      "A memoir about a woman who grows up in a survivalist family and eventually earns a PhD from Cambridge.",
    cover_type: "paperback",
    condition: 9,
    condition_details: "Minor creases on cover, pages like new.",
    //   thumbnail_url: "https://example.com/images/educated_thumb.jpg",
    //   image_urls: [
    //     "https://example.com/images/educated_1.jpg"
    //   ],
    status: "forRent",
    price: 20000,
    //   uploaded_by: 102,
    created_at: new Date("2025-01-10T15:00:00Z"),
    updated_at: new Date("2025-03-25T08:45:00Z"),
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    genres: ["self-help", "productivity", "psychology"],
    synopsis:
      "A guide to building good habits and breaking bad ones using small, consistent changes.",
    cover_type: "paperback",
    condition: 10,
    condition_details: "Like new. No visible damage.",
    //   thumbnail_url: "https://example.com/images/atomic_habits_thumb.jpg",
    //   image_urls: [
    //     "https://example.com/images/atomic_habits_1.jpg",
    //     "https://example.com/images/atomic_habits_2.jpg",
    //     "https://example.com/images/atomic_habits_3.jpg"
    //   ],
    status: "isClosed",
    price: 22000,
    //   uploaded_by: 103,
    created_at: new Date("2024-11-20T09:00:00Z"),
    updated_at: new Date("2025-02-10T11:30:00Z"),
  },
];

export const typeDefs = `#graphql
    
    enum CoverType {
      hardcover
      paperback
    }

    enum BookStatus {
      isClosed
      forRent
    }

      type Book {
      id: Int!
      title: String!
      author: String!
      genres: [String!]!
      synopsis: String
      cover_type: CoverType!
      condition: Int!
      condition_details: String
      status: BookStatus!
      price: Int!
      created_at: String!
      updated_at: String!
      }

      type Query {
        findAll: [Book]
      }
    `;

export const resolvers = {
  Query: {
    findAll: function () {
      return books;
    },
  },
};
