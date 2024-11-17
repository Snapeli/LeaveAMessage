const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/* 连接 MongoDB Atlas */
const uri = "mongodb+srv://snapeli2023:zdQPuVPOBtslwy16@cluster0.z2x7ljj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB:", err));


// 创建 postSchema 模型
const postSchema = new mongoose.Schema({
    postTitle: String,
    postContent: String,
    nickname:{
        type:String,
        required: true, // 确保昵称是必填项
    },
    timestamp: {
        type: Date,
        default: Date.now, // 自动记录留言的时间
    }
});
const Post = mongoose.model('Post', postSchema);

// app.post() 路由，将项目从 MongoDB 创建/储存
app.post("/compose", async (req, res) => {
    const { nickname, postTitle, postBody } = req.body;

    if (!nickname) {
        return res.render("compose", { error: true });
         // 传递 error: true
    }

    console.log("Received nickname:", nickname);
    console.log("Received title:", postTitle);
    console.log("Received content:", postBody);

    // 创建新的文档实例
    const post = new Post({
        nickname,
        postTitle,
        postContent: postBody,
        timestamp: new Date() 
    });

    try {
        // 将文档保存到 MongoDB
        await post.save();
        console.log(`Post by "${nickname}" with title "${postTitle}" added successfully.`);
        res.render("success"); // 成功后重定向到主页
    } catch (error) {
        console.error("Error saving post to MongoDB:", error);
        res.render("failure");
    }
});

// app.get() 路由，从 MongoDB 获取数据并渲染
app.get("/", async (req, res) => {
    try {
        const posts = await Post.find({}); // 从 MongoDB 中获取所有文章
        res.render("home", { posts: posts }); // 将文章数组传递给 home.ejs
    } catch (error) {
        console.error("Error fetching posts from MongoDB:", error);
        res.status(500).send("Error fetching posts.");
    }
});

app.get("/aboutMe", (req, res) => {
    res.render("aboutMe");  // 渲染位于 views 文件夹中的 aboutMe.ejs
});

app.get("/contact",(req,res)=>{
    res.render("contact",{contact:contactContent});
});

app.get("/compose", (req, res) => {
    res.render("compose", { error: false }); // 默认传递 error: false
});

// 查看特定文章
app.get("/posts/:postName", async (req, res) => {
    const requestedTitle = _.lowerCase(req.params.postName);
  
    try {
      const posts = await Post.find(); // 从 MongoDB 加载所有文章
      const matchedPost = posts.find((post) => _.lowerCase(post.postTitle) === requestedTitle);
  
      if (matchedPost) {
        res.render("posts", {
          showTitle: matchedPost.postTitle,
          showContent: matchedPost.postContent,
          nickname: matchedPost.nickname,
          timestamp: matchedPost.timestamp
        });
      } else {
        console.log("No match found!");
        res.redirect("/");
      }
    } catch (error) {
      console.error("Error fetching posts from MongoDB:", error);
      res.send("Error loading post.");
    }
});

app.get("/posts",(req,res)=>{
    res.render("posts");
});


app.listen(3000,function(){
    console.log("Server started on port 3000");
});