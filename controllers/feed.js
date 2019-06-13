exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{title: 'First Post', content: 'This is the first Post!'}]
    });
}

exports.createPost = (req, res, next) => {
    //Create post in db
    const title = req.body.title;
    const content = req.body.content;
    console.log(title, content);
    res.json({
        message: 'Post created successfully!',
        post: {id: new Date().toISOString(), title: title, content: content}
    });
}