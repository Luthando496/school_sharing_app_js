"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import ImagePicker from "./ImagePicker";
import { useRouter } from "next/navigation";
import { newPost } from "@/app/actions/newPost";
import useAuthStore from "@/store/store";
import { tagNames } from "@/utils/tagNames";
import { revalidatePath } from "next/cache";

function MyEditor() {
  const [image, setImage] = useState("");
  const router = useRouter();
  const { user } = useAuthStore(state => state);

  const tags = ["Travel", "Food", "News", "Lifestyle", "Business", "Tech", "Fashion", "Health", "Fitness", "Sports", "Entertainment", "Ferrari", "Cars", "Food", "Movies", "Watches", "Homes", "Houses", "Decor", "Garden", "Coding", "Programming", "Music"];

  const categories = ["Travel", "News", "Food", "Lifestyle", "Business", "Tech", "Fashion", "Health", "Fitness", "Sports", "Entertainment", "Ferrari", "Cars", "Food", "Movies", "Watches", "Homes", "Houses", "Decor", "Garden", "Coding", "Programming", "Music"];
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [textData, setTextData] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const setHandleData = async () => {
    if (!user) return;

    const data = {
      author: user?.user_metada?.full_name, 
      title,
      category,
      description: textData,
      post_image: image,
      tags: selectedTags,
    };
    
    const post = await newPost(data);
    console.log(post,"my post data")
    if (post) {
      console.log("Post created successfully! ",post);
      router.push(`/posts/${tagNames(post.title)}`); // Fix if needed
    }
  };

  const handleInputs = (e) => {
    const value = e.target.value;
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter(tag => tag !== value) : [...prev, value]
    );
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }], // Fix list type
      [{ align: [] }],
      [{ color: [] }],
      ["code-block"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "image",
    "align",
    "color",
    "code-block",
  ];

  return (
    <>
      {/* {!user ? (
        <h1 className="text-center font-play text-4xl">No user Found</h1>
      ) : ( */}
        <>
          <div className="px-40 mx-auto my-14">
            <ImagePicker location={"post"} myData={textData} setHandleImage={setImage} />
            {/* <input type="file" name="image" onChange={(e)=> setImage(e.target.files[0])} id="image" /> */}
          </div>

          <div className="px-24 my-4">
            <div className="form">
              <div className="form-group my-4 w-1/3">
                <label htmlFor="title">Post Title</label>
                <input
                  type="text"
                  id="title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  name="title"
                  placeholder="Title"
                  className="w-full border focus:outline-none focus:border-green-500 border-gray-300 rounded p-2"
                />
              </div>

              <div className="form-group my-4 w-1/3">
                <select onChange={(e) => setCategory(e.target.value)} defaultValue="Travel" className="w-full border focus:outline-none focus:border-green-500 border-gray-300 rounded p-2">
                  {categories.map((cate, index) => (
                    <option key={index} value={cate}>{cate}</option>
                  ))}
                </select>
              </div>
            </div>

            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              value={textData}
              onChange={setTextData}
            />
          </div>

          <div className="my-8 px-14">
            <div className="flex flex-col gap-2">
              <label htmlFor="tags">Tags</label>
              <div className="grid grid-cols-4 gap-4">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag}
                      checked={selectedTags.includes(tag)}
                      onChange={handleInputs}
                      className="cursor-pointer"
                    />
                    <label htmlFor={tag} className="cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="my-8">
            <button onClick={setHandleData} className="bg-orange-600 mx-auto ml-24 duration-300 tracking-[3px] uppercase text-slate-900 border hover:shadow-md p-5 hover:-translate-y-2 rounded-md hover:shadow-black">
              Submit Blog
            </button>
          </div>
        </>
      {/* )} */}
    </>
  );
}

export default MyEditor;