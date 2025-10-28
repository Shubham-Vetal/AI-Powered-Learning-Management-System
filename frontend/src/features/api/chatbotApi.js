import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHATBOT_API = "https://lms-backend-7o2h.onrender.com/api/v1/chatbot/";

export const chatbotApi = createApi({
  reducerPath: "chatbotApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CHATBOT_API,
    credentials: "include", 
  }),
  endpoints: (builder) => ({
    askLectureTutor: builder.mutation({
      query: ({ courseId, lectureId, question }) => ({
        url: `course/${courseId}/lecture/${lectureId}/ask`,
        method: "POST",
        body: { question },
      }),
    }),
  }),
});

export const { useAskLectureTutorMutation } = chatbotApi;
