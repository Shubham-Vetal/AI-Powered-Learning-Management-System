import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const RichTextEditor = ({ input = {}, setInput }) => {
  const value = input.description || "";

  const handleChange = (content) => {
    if (setInput) {
      setInput({ ...input, description: content });
    }
  };

  return (
    <div>
      <ReactQuill theme="snow" value={value} onChange={handleChange} />
    </div>
  );
};

export default RichTextEditor;
