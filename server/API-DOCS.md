# Book Rental System GraphQL API Documentation

This document provides details on all available GraphQL queries and mutations, organized by resource type.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
  - [Queries](#user-queries)
  - [Mutations](#user-mutations)
- [Books](#books)
  - [Queries](#book-queries)
  - [Mutations](#book-mutations)
- [Rentals](#rentals)
  - [Queries](#rental-queries)
  - [Mutations](#rental-mutations)
- [Rental Details](#rental-details)
  - [Queries](#rental-detail-queries)
  - [Mutations](#rental-detail-mutations)
- [Rooms](#rooms)
  - [Queries](#room-queries)
  - [Mutations](#room-mutations)
- [Chats](#chats)
  - [Queries](#chat-queries)
  - [Mutations](#chat-mutations)

## Authentication

Authentication is handled using JWT tokens. For protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Most queries and mutations require authentication. Those that don't will be marked as "Public".

---

## Users

### User Queries

#### `findAllUsers`

Retrieves all users in the system.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    name: String!
    username: String!
    phone_number: String
    address: String
    created_at: String
    updated_at: String
  }
]
```

#### `findUserById`

Retrieves a specific user by ID.

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the user to retrieve

**Response**:

```graphql
{
  _id: ID!
  name: String!
  username: String!
  phone_number: String
  address: String
  created_at: String
  updated_at: String
}
```

#### `me`

Retrieves the currently authenticated user's profile.

**Authentication Required**: Yes

**Response**:

```graphql
{
  _id: ID!
  name: String!
  username: String!
  phone_number: String
  address: String
  created_at: String
  updated_at: String
}
```

### User Mutations

#### `register`

Registers a new user account.

**Authentication Required**: No (Public)

**Parameters**:

- `input: RegisterInput!` - User registration data
  ```graphql
  {
    name: String!
    username: String!
    password: String!
    phone_number: String
    address: String
  }
  ```

**Response**:

```graphql
{
  token: String!
  user: {
    _id: ID!
    name: String!
    username: String!
    phone_number: String
    address: String
    created_at: String
    updated_at: String
  }
}
```

#### `login`

Authenticates a user and returns a JWT token.

**Authentication Required**: No (Public)

**Parameters**:

- `input: LoginInput!` - Login credentials
  ```graphql
  {
    username: String!
    password: String!
  }
  ```

**Response**:

```graphql
{
  token: String!
  user: {
    _id: ID!
    name: String!
    username: String!
    phone_number: String
    address: String
    created_at: String
    updated_at: String
  }
}
```

#### `updateUser`

Updates the authenticated user's profile information.

**Authentication Required**: Yes

**Parameters**:

- `input: UpdateUserInput!` - User data to update
  ```graphql
  {
    name: String
    phone_number: String
    address: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  name: String!
  username: String!
  phone_number: String
  address: String
  created_at: String
  updated_at: String
}
```

#### `updatePassword`

Updates the authenticated user's password.

**Authentication Required**: Yes

**Parameters**:

- `input: UpdatePasswordInput!` - Password change data
  ```graphql
  {
    currentPassword: String!
    newPassword: String!
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  name: String!
  username: String!
  phone_number: String
  address: String
  created_at: String
  updated_at: String
}
```

#### `deleteUser`

Deletes a user account (only the authenticated user can delete their own account).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the user to delete (must match the authenticated user's ID)

**Response**:

```graphql
String  # A success message
```

---

## Books

### Book Queries

#### `findAll`

Retrieves all books.

**Authentication Required**: No (Public)

**Response**:

```graphql
[
  {
    _id: ID!
    title: String!
    author: String!
    genres: [String!]!
    synopsis: String
    cover_type: CoverType!  # "hardcover" or "paperback"
    condition: Int!  # 0-10
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus!  # "isClosed" or "forRent"
    price: Int!
    uploaded_by: ID!
    created_at: String!
    updated_at: String!
  }
]
```

#### `findBookById`

Retrieves a specific book by ID.

**Authentication Required**: No (Public)

**Parameters**:

- `id: ID!` - The ID of the book to retrieve

**Response**:

```graphql
{
  _id: ID!
  title: String!
  author: String!
  genres: [String!]!
  synopsis: String
  cover_type: CoverType!
  condition: Int!
  condition_details: String
  thumbnail_url: String
  image_urls: [String]
  status: BookStatus!
  price: Int!
  uploaded_by: ID!
  created_at: String!
  updated_at: String!
}
```

#### `searchBooks`

Searches for books by title, author, or genre.

**Authentication Required**: No (Public)

**Parameters**:

- `query: String!` - The search term
- `options: BookOptions` - Optional pagination and sorting parameters
  ```graphql
  {
    limit: Int
    skip: Int
    sortField: String
    sortOrder: Int
  }
  ```

**Response**:

```graphql
[
  {
    _id: ID!
    title: String!
    author: String!
    genres: [String!]!
    synopsis: String
    cover_type: CoverType!
    condition: Int!
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus!
    price: Int!
    uploaded_by: ID!
    created_at: String!
    updated_at: String!
  }
]
```

#### `filterBooks`

Filters books by various criteria.

**Authentication Required**: No (Public)

**Parameters**:

- `filters: BookFilters!` - Filter criteria
  ```graphql
  {
    status: BookStatus
    minPrice: Int
    maxPrice: Int
    genres: [String]
    cover_type: CoverType
  }
  ```
- `options: BookOptions` - Optional pagination and sorting parameters
  ```graphql
  {
    limit: Int
    skip: Int
    sortField: String
    sortOrder: Int
  }
  ```

**Response**:

```graphql
[
  {
    _id: ID!
    title: String!
    author: String!
    genres: [String!]!
    synopsis: String
    cover_type: CoverType!
    condition: Int!
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus!
    price: Int!
    uploaded_by: ID!
    created_at: String!
    updated_at: String!
  }
]
```

#### `isBookAvailable`

Checks if a book is available for rental.

**Authentication Required**: No (Public)

**Parameters**:

- `id: ID!` - The ID of the book to check

**Response**:

```graphql
Boolean  # true if available, false if currently rented
```

#### `myBooks`

Retrieves all books uploaded by the authenticated user.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    title: String!
    author: String!
    genres: [String!]!
    synopsis: String
    cover_type: CoverType!
    condition: Int!
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus!
    price: Int!
    uploaded_by: ID!
    created_at: String!
    updated_at: String!
  }
]
```

### Book Mutations

#### `addBook`

Adds a new book to the system.

**Authentication Required**: Yes

**Parameters**:

- `input: AddBookInput!` - Book data
  ```graphql
  {
    title: String!
    author: String!
    genres: [String!]!
    synopsis: String
    cover_type: CoverType!  # "hardcover" or "paperback"
    condition: Int!  # 0-10
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus!  # "isClosed" or "forRent"
    price: Int!
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  title: String!
  author: String!
  genres: [String!]!
  synopsis: String
  cover_type: CoverType!
  condition: Int!
  condition_details: String
  thumbnail_url: String
  image_urls: [String]
  status: BookStatus!
  price: Int!
  uploaded_by: ID!
  created_at: String!
  updated_at: String!
}
```

#### `updateBook`

Updates a book's information (only the uploader can update their own books).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the book to update
- `input: UpdateBookInput!` - Book data to update
  ```graphql
  {
    title: String
    author: String
    genres: [String!]
    synopsis: String
    cover_type: CoverType
    condition: Int
    condition_details: String
    thumbnail_url: String
    image_urls: [String]
    status: BookStatus
    price: Int
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  title: String!
  author: String!
  genres: [String!]!
  synopsis: String
  cover_type: CoverType!
  condition: Int!
  condition_details: String
  thumbnail_url: String
  image_urls: [String]
  status: BookStatus!
  price: Int!
  uploaded_by: ID!
  created_at: String!
  updated_at: String!
}
```

#### `deleteBook`

Deletes a book (only the uploader can delete their own books).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the book to delete

**Response**:

```graphql
String  # A success message
```

---

## Rentals

### Rental Queries

#### `findAllRentals`

Retrieves all rentals.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    total_amount: Int!
    status: RentalStatus!  # "pending", "completed", or "failed"
    payment_method: String
    paid_date: String
    created_at: String!
    updated_at: String!
    details: [RentalDetail]  # Associated rental details
  }
]
```

#### `findRentalById`

Retrieves a specific rental by ID.

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental to retrieve

**Response**:

```graphql
{
  _id: ID!
  user_id: String!
  total_amount: Int!
  status: RentalStatus!
  payment_method: String
  paid_date: String
  created_at: String!
  updated_at: String!
  details: [RentalDetail]
}
```

#### `findRentalsByUserId`

Retrieves all rentals for a specific user.

**Authentication Required**: Yes

**Parameters**:

- `userId: String!` - The ID of the user whose rentals to retrieve

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    total_amount: Int!
    status: RentalStatus!
    payment_method: String
    paid_date: String
    created_at: String!
    updated_at: String!
    details: [RentalDetail]
  }
]
```

#### `myRentals`

Retrieves all rentals for the authenticated user.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    total_amount: Int!
    status: RentalStatus!
    payment_method: String
    paid_date: String
    created_at: String!
    updated_at: String!
    details: [RentalDetail]
  }
]
```

### Rental Mutations

#### `createRental`

Creates a new rental.

**Authentication Required**: Yes

**Parameters**:

- `input: CreateRentalInput!` - Rental data
  ```graphql
  {
    user_id: String!  # Must match the authenticated user's ID
    total_amount: Int!
    payment_method: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  user_id: String!
  total_amount: Int!
  status: RentalStatus!
  payment_method: String
  paid_date: String
  created_at: String!
  updated_at: String!
  details: [RentalDetail]
}
```

#### `updateRentalStatus`

Updates a rental's status (only the renter can update their own rentals).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental to update
- `input: UpdateRentalStatusInput!` - Status update data
  ```graphql
  {
    status: RentalStatus!  # "pending", "completed", or "failed"
    payment_method: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  user_id: String!
  total_amount: Int!
  status: RentalStatus!
  payment_method: String
  paid_date: String
  created_at: String!
  updated_at: String!
  details: [RentalDetail]
}
```

#### `deleteRental`

Deletes a rental (only the renter can delete their own rentals).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental to delete

**Response**:

```graphql
String  # A success message
```

---

## Rental Details

### Rental Detail Queries

#### `findRentalDetail`

Retrieves a specific rental detail by ID.

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental detail to retrieve

**Response**:

```graphql
{
  _id: ID!
  book_id: String!
  price: Int!
  period: Int!
  total: Int!
  title: String!
  author: String!
  genres: [String]
  synopsis: String
  cover_type: String!
  thumbnail_url: String
  image_urls: [String]
  rental_id: String!
  rental_start: String!
  rental_end: String!
  created_at: String!
  updated_at: String!
}
```

#### `findRentalDetailsByRentalId`

Retrieves all rental details for a specific rental.

**Authentication Required**: Yes

**Parameters**:

- `rentalId: String!` - The ID of the rental whose details to retrieve

**Response**:

```graphql
[
  {
    _id: ID!
    book_id: String!
    price: Int!
    period: Int!
    total: Int!
    title: String!
    author: String!
    genres: [String]
    synopsis: String
    cover_type: String!
    thumbnail_url: String
    image_urls: [String]
    rental_id: String!
    rental_start: String!
    rental_end: String!
    created_at: String!
    updated_at: String!
  }
]
```

#### `findActiveRentalsByBookId`

Retrieves all active rentals for a specific book.

**Authentication Required**: Yes

**Parameters**:

- `bookId: String!` - The ID of the book whose active rentals to retrieve

**Response**:

```graphql
[
  {
    _id: ID!
    book_id: String!
    price: Int!
    period: Int!
    total: Int!
    title: String!
    author: String!
    genres: [String]
    synopsis: String
    cover_type: String!
    thumbnail_url: String
    image_urls: [String]
    rental_id: String!
    rental_start: String!
    rental_end: String!
    created_at: String!
    updated_at: String!
  }
]
```

### Rental Detail Mutations

#### `createRentalDetail`

Creates a new rental detail.

**Authentication Required**: Yes

**Parameters**:

- `input: CreateRentalDetailInput!` - Rental detail data
  ```graphql
  {
    book_id: String!
    price: Int!
    period: Int!
    title: String!
    author: String!
    genres: [String]
    synopsis: String
    cover_type: String!
    thumbnail_url: String
    image_urls: [String]
    rental_id: String!  # Must be associated with the authenticated user
    rental_start: String
    rental_end: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  book_id: String!
  price: Int!
  period: Int!
  total: Int!
  title: String!
  author: String!
  genres: [String]
  synopsis: String
  cover_type: String!
  thumbnail_url: String
  image_urls: [String]
  rental_id: String!
  rental_start: String!
  rental_end: String!
  created_at: String!
  updated_at: String!
}
```

#### `updateRentalDetail`

Updates a rental detail (only the renter can update their own rental details).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental detail to update
- `input: UpdateRentalDetailInput!` - Rental detail data to update
  ```graphql
  {
    price: Int
    period: Int
    rental_start: String
    rental_end: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  book_id: String!
  price: Int!
  period: Int!
  total: Int!
  title: String!
  author: String!
  genres: [String]
  synopsis: String
  cover_type: String!
  thumbnail_url: String
  image_urls: [String]
  rental_id: String!
  rental_start: String!
  rental_end: String!
  created_at: String!
  updated_at: String!
}
```

#### `deleteRentalDetail`

Deletes a rental detail (only the renter can delete their own rental details).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the rental detail to delete

**Response**:

```graphql
String  # A success message
```

---

## Rooms

### Room Queries

#### `findAllRooms`

Retrieves all chat rooms.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    created_at: String!
    updated_at: String!
    user: User  # The user who created the room
    chats: [Chat]  # Associated chats
  }
]
```

#### `findRoomById`

Retrieves a specific chat room by ID.

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the room to retrieve

**Response**:

```graphql
{
  _id: ID!
  user_id: String!
  created_at: String!
  updated_at: String!
  user: User
  chats: [Chat]
}
```

#### `findRoomsByUserId`

Retrieves all chat rooms for a specific user.

**Authentication Required**: Yes

**Parameters**:

- `userId: String!` - The ID of the user whose rooms to retrieve

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    created_at: String!
    updated_at: String!
    user: User
    chats: [Chat]
  }
]
```

#### `myRooms`

Retrieves all chat rooms for the authenticated user.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    user_id: String!
    created_at: String!
    updated_at: String!
    user: User
    chats: [Chat]
  }
]
```

### Room Mutations

#### `createRoom`

Creates a new chat room.

**Authentication Required**: Yes

**Parameters**:

- `input: CreateRoomInput!` - Room data
  ```graphql
  {
    user_id: String!  # The user to chat with
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  user_id: String!
  created_at: String!
  updated_at: String!
  user: User
  chats: [Chat]
}
```

#### `deleteRoom`

Deletes a chat room (only the room creator can delete their own rooms).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the room to delete

**Response**:

```graphql
String  # A success message
```

---

## Chats

### Chat Queries

#### `findAllChats`

Retrieves all chats.

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
    created_at: String!
    updated_at: String!
    sender: User
    receiver: User
  }
]
```

#### `findChatById`

Retrieves a specific chat by ID.

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the chat to retrieve

**Response**:

```graphql
{
  _id: ID!
  sender_id: String!
  receiver_id: String!
  message: String!
  room_id: String!
  created_at: String!
  updated_at: String!
  sender: User
  receiver: User
}
```

#### `findChatsByRoomId`

Retrieves all chats in a specific room.

**Authentication Required**: Yes

**Parameters**:

- `roomId: String!` - The ID of the room whose chats to retrieve

**Response**:

```graphql
[
  {
    _id: ID!
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
    created_at: String!
    updated_at: String!
    sender: User
    receiver: User
  }
]
```

#### `findChatsBetweenUsers`

Retrieves all chats between two specific users.

**Authentication Required**: Yes

**Parameters**:

- `senderId: String!` - The ID of the first user
- `receiverId: String!` - The ID of the second user

**Response**:

```graphql
[
  {
    _id: ID!
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
    created_at: String!
    updated_at: String!
    sender: User
    receiver: User
  }
]
```

#### `myChats`

Retrieves all chats for the authenticated user (as either sender or receiver).

**Authentication Required**: Yes

**Response**:

```graphql
[
  {
    _id: ID!
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
    created_at: String!
    updated_at: String!
    sender: User
    receiver: User
  }
]
```

### Chat Mutations

#### `createChat`

Creates a new chat message.

**Authentication Required**: Yes

**Parameters**:

- `input: CreateChatInput!` - Chat data
  ```graphql
  {
    sender_id: String!  # Must match the authenticated user's ID
    receiver_id: String!
    message: String!
    room_id: String!
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  sender_id: String!
  receiver_id: String!
  message: String!
  room_id: String!
  created_at: String!
  updated_at: String!
  sender: User
  receiver: User
}
```

#### `updateChat`

Updates a chat message (only the sender can update their own messages).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the chat to update
- `input: UpdateChatInput!` - Chat data to update
  ```graphql
  {
    message: String
  }
  ```

**Response**:

```graphql
{
  _id: ID!
  sender_id: String!
  receiver_id: String!
  message: String!
  room_id: String!
  created_at: String!
  updated_at: String!
  sender: User
  receiver: User
}
```

#### `deleteChat`

Deletes a chat message (only the sender can delete their own messages).

**Authentication Required**: Yes

**Parameters**:

- `id: ID!` - The ID of the chat to delete

**Response**:

```graphql
String  # A success message
```

#### `sendMessage`

Convenience mutation to send a message to another user (creates a room if needed).

**Authentication Required**: Yes

**Parameters**:

- `receiverId: String!` - The ID of the user to send the message to
- `message: String!` - The message content

**Response**:

```graphql
{
  _id: ID!
  sender_id: String!
  receiver_id: String!
  message: String!
  room_id: String!
  created_at: String!
  updated_at: String!
  sender: User
  receiver: User
}
```
