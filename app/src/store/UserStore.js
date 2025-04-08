import { create } from "zustand";
import { gql } from "@apollo/client";
import client from "../config/apollo";

const GET_CURRENT_USER = gql`
  query Me {
    me {
      _id
      name
      username
      phone_number
      address
      created_at
      updated_at
    }
  }
`;

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Fetch user data yang login
  fetchUser: async () => {
    set({ loading: true });

    try {
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        fetchPolicy: "no-cache",
      });

      set({
        user: data.me,
        loading: false,
        error: null,
      });

      return data.me;
    } catch (error) {
      set({
        user: null,
        loading: false,
        error: error.message,
      });

      return null;
    }
  },

  // Clear user data (pas logout)
  clearUser: () => {
    set({
      user: null,
      loading: false,
      error: null,
    });
  },

  // cek apakah user adalah owner dari resource yang diberikan
  isOwner: (resourceUploaderId) => {
    const state = useUserStore.getState();
    return state.user && state.user._id === resourceUploaderId;
  },
}));
