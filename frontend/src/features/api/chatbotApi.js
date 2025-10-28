import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHATBOT_API = "http://localhost:8000/api/v1/chatbot/";

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
