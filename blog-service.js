//manual read from data file:
//const fs = require("fs");
//const { resolve } = require("path");
//var postsArray = [];
//var categoriesArray = [];

//setup sequelize

const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "sqvlcesk",
  "sqvlcesk",
  "0D0Bp8Zzt91BSK9dH4t2izILgqyUoD5F",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

//define data models

var Post = sequelize.define(
  "Post",
  {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);
var Category = sequelize.define(
  "Category",
  {
    category: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);
Post.belongsTo(Category, { foreignKey: "category" });

const { gte } = Sequelize.Op;

//starter
module.exports.initialize = () => {
  // return new Promise((resolve, reject) => {
  //   try {
  //     fs.readFile("./data/posts.json", (err, data) => {
  //       if (err) throw err;
  //       postsArray = JSON.parse(data);
  //       console.log("posts read");
  //     });
  //     fs.readFile("./data/categories.json", (err, data) => {
  //       if (err) throw err;
  //       categoriesArray = JSON.parse(data);
  //       console.log("categories read");
  //     });
  //   } catch (err) {
  //     console.log("unable to read file");
  //     var err = "unable to read file";
  //     reject({ message: err });
  //   }
  //   resolve("success");
  // });
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log("PostgresDB SYNC COMPLETE!");
        resolve();
      })
      .catch((err) => {
        console.log("DATABASE SYNC FAILED! Error: " + err);
        reject("unable to sync the database");
      });
  });
};

//queries:
// 1. get all post
module.exports.getAllPosts = () => {
  // return new Promise((resolve, reject) => {
  //   if (postsArray.length === 0) {
  //     var err = "no results returned";
  //     reject({ message: err });
  //   }
  //   resolve(postsArray);
  // });
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => {
        console.log("POSTS FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND POSTS! Error: " + err);
        reject("no results returned");
      });
  });
};

// 2. get published only
module.exports.getPublishedPosts = () => {
  // return new Promise((resolve, reject) => {
  //   var publishedPosts = [];
  //   for (let i = 0; i < postsArray.length; i++) {
  //     if (postsArray[i].published) {
  //       publishedPosts.push(postsArray[i]);
  //     }
  //   }
  //   if (publishedPosts.length === 0) {
  //     var err = "no results returned";
  //     reject({ message: err });
  //   } else {
  //     resolve(publishedPosts);
  //   }
  // });
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
      },
    })
      .then((data) => {
        console.log("PUBLISHED POSTS FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND PUBLISHED POSTS! Error: " + err);
        reject("no results returned");
      });
  });
};

// 3. get all categories
module.exports.getCategories = () => {
  // return new Promise((resolve, reject) => {
  //   if (categoriesArray.length === 0) {
  //     var err = "no results returned";
  //     reject({ message: err });
  //   } else {
  //     resolve(categoriesArray);
  //   }
  // });
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        console.log("CATEGORY FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND CATEGORIES! Error: " + err);
        reject("no results returned");
      });
  });
};

// 4. get posts by category
module.exports.getPostsByCategory = (categoryId) => {
  // return new Promise((resolve, reject) => {
  //   let filteredPosts = postsArray.filter((post) => post.category == category);

  //   if (filteredPosts.length == 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(filteredPosts);
  //   }
  // });
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: categoryId,
      },
    })
      .then((data) => {
        console.log("POSTS FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND POSTS! Error: " + err);
        reject("no results returned");
      });
  });
};

// 5. get posts by date
module.exports.getPostsByMinDate = (minDateStr) => {
  // return new Promise((resolve, reject) => {
  //   let filteredPosts = postsArray.filter(
  //     (post) => new Date(post.postDate) >= new Date(minDateStr)
  //   );
  //   if (filteredPosts.length == 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(filteredPosts);
  //   }
  // });
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        console.log("POSTS FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND POSTS! Error: " + err);
        reject("no results returned");
      });
  });
};

// 6. get posts by id
module.exports.getPostById = (id) => {
  // return new Promise((resolve, reject) => {
  //   var filteredPost;
  //   for (let i = 0; i < postsArray.length; i++) {
  //     if (postsArray[i].id == id) {
  //       filteredPost = postsArray[i];
  //     }
  //   }
  //   if (filteredPost) {
  //     resolve(filteredPost);
  //   } else {
  //     reject("no results returned");
  //   }
  // });
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id,
      },
      // include: [{ required: false }],
    })
      .then((data) => {
        // console.log(data);
        // resolve(data[0]);
        if (data.length !== 0) {
          console.log("POSTS FOUND!");
          resolve(data[0]);
        } else {
          console.log("CAN'T FIND POSTS!");
          reject();
        }
      })
      .catch((err) => {
        console.log("CAN'T FIND POSTS BY ID! Error: " + err);
        reject();
      });
  });
};

// 7. get published posts by category
module.exports.getPublishedPostsByCategory = (categoryId) => {
  // return new Promise((resolve, reject) => {
  //   var publishedPosts = [];
  //   for (let i = 0; i < postsArray.length; i++) {
  //     if (postsArray[i].published && postsArray[i].category == category) {
  //       publishedPosts.push(postsArray[i]);
  //     }
  //   }
  //   if (publishedPosts.length === 0) {
  //     var err = "no results returned";
  //     reject({ message: err });
  //   } else {
  //     resolve(publishedPosts);
  //   }
  // });
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
        category: categoryId,
      },
    })
      .then((data) => {
        console.log("POSTS FOUND!");
        resolve(data);
      })
      .catch((err) => {
        console.log("CAN'T FIND POSTS! Error: " + err);
        reject("no results returned");
      });
  });
};

// 8. add new post
module.exports.addPost = (postData) => {
  // return new Promise((resolve, reject) => {
  //   if (!postData.published) {
  //     postData.published = false;
  //   } else {
  //     postData.published = true;
  //   }
  //   postData.id = postsArray.length + 1;
  //   postData.postDate = new Date().toISOString().slice(0, 10);
  //   postsArray.push(postData);
  //   resolve(postsArray);
  // });
  return new Promise((resolve, reject) => {
    //set boolean value and set empty value to null
    postData.published = postData.published ? true : false;
    for (var prop in postData) {
      if (postData[prop] == "") {
        postData[prop] = null;
      }
    }

    postData.postDate = new Date();

    Post.create(postData)
      .then(() => {
        console.log("POST CREATED!");
        resolve();
      })
      .catch(() => {
        reject("unable to create post");
      });
  });
};

//9.
module.exports.addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    //set empty value to null
    for (var prop in categoryData) {
      if (categoryData[prop] == "") {
        categoryData[prop] = null;
      }
    }
    Category.create(categoryData)
      .then(() => {
        console.log("CATEGORY CREATED!");
        resolve();
      })
      .catch(() => {
        reject("unable to create category");
      });
  });
};

//10. delete category by id
module.exports.deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        console.log("CATEGORY DELETED!");
        resolve();
      })
      .catch((err) => {
        console.log("CATEGORY DELETION ERROR! Error: " + err);
      });
  });
};

//11. delete post by id
module.exports.deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        console.log("POST DELETED!");
        resolve();
      })
      .catch((err) => {
        console.log("POST DELETION ERROR! Error: " + err);
      });
  });
};
