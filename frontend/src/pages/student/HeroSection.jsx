import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-[55px] px-6 text-center ">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 -z-10 opacity-30 blur-3xl">
        <div className="absolute w-72 h-72 bg-indigo-400 rounded-full top-10 left-10 mix-blend-multiply animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full bottom-10 right-10 mix-blend-multiply animate-pulse delay-1000"></div>
      </div>

      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 dark:from-blue-400 dark:to-indigo-300">
          Find the Best Courses for You
        </h1>
        <p className="text-gray-100/90 dark:text-gray-400 mb-10 text-lg">
          Discover, Learn, and Upskill with our wide range of expert-led courses.
        </p>

        {/* Search bar */}
        <form
          onSubmit={searchHandler}
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto transition-all focus-within:ring-2 focus-within:ring-blue-500"
        >
          <div className="pl-4 text-gray-500 dark:text-gray-400">
            <Search size={20} />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Courses..."
            className="flex-grow border-none focus-visible:ring-0 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          />
          <Button
            type="submit"
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-all"
          >
            Search
          </Button>
        </form>

        {/* Explore button */}
        <Button
            onClick={() => navigate(`/course/search?query`)}
            variant="outline"
            className="mt-8 bg-white/10 dark:bg-white/5 text-white border-2 border-white/30 hover:bg-white hover:text-blue-600 dark:hover:bg-white dark:hover:text-gray-900 rounded-full px-8 py-3 font-medium transition-all backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
          >
            Explore All Courses
          </Button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
