// function for recommendation
const axios = require("axios");

const pre_process = async (str) => {
  // defining stop words
  const stopWords = ["the", "and", "is", "in", "to", "of", "a", "with", "this"];
  // removing everything except alphabets
  const lettersOnly = str.replace(/[^a-zA-Z ]/g, "");
  // converting everything to lowercase
  const lowerCaseString = lettersOnly.toLowerCase();
  // splitting the string into words
  const words = lowerCaseString.split(" ");
  // removing stop words
  const refinedWords = words.filter((word) => !stopWords.includes(word));
  // joining the words back to form a string
  const refinedString = refinedWords.join(" ");
  return refinedString;
};

const refined_request = async (currentBlog, allBlogs) => {
  // intialize an empty list
  const bodies = [];
  for (let i = 0; i < allBlogs.length; i++) {
    // we will store title corresponding to the body
    const id = allBlogs[i]._id;
    // console.log(typeof(id));
    const unrefined_string = allBlogs[i].body;
    const content = await pre_process(unrefined_string);
    const data = {
      id,
      content,
    };
    bodies.push(data);
  }

  // now we have an array of objects where each object contains the title and the refined string
  // request body format: {{I'd, content}, [{I'd, content}]}
  // Request body
  const request_body = {
    created_blog: {
      id: currentBlog._id,
      content: currentBlog.body,
    },
    blog_list: bodies,
  };
  // console.log("ids", request_body.blog_list.map((item) => item.id));
  // sending the request to the server to get the similiarities between the blogs
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/tagify/",
      request_body
    );
    return response.data;
  } catch (error) {
    console.error("Error making request:", error.message);
    throw error;
  }
};

// function for selecting the top 3 blogs with greatest similiarity
// this same function we can use for the search functionality as well

// sorting the similiarties values based upon similiarity values in descending order

// default start and end parameter are 1 and 4 respectively
const select_top_3 = async (start = 1, end = 4, results) => {
  let sortedSimiliarities = results.similarities.sort((a, b) => {
    return b.similarity - a.similarity;
  });
  // extracting the top 3 id's with highest similiarity values
  let top3 = sortedSimiliarities.slice(start, end).map((item) => item.id);
  return top3;
};

module.exports = {
  pre_process,
  refined_request,
  select_top_3,
};
