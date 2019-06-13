const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find().then(posts => {
        res.status(200).json({
            message: 'fetched post successfully.', posts: posts
        });
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
    // res.status(200).json({
    //     posts: [
    //         {
    //             _id: 1,
    //             title: 'First Post',
    //             content: 'This is the first Post!', 
    //             imageUrl: 'images/images(2).png',
    //             creator: {
    //                 name: 'PingPong'
    //             },
    //             createAt: new Date()
    //          }
    //         ]
    // });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({
        //     message: 'Validation failed, entered data is incorrect.',
        //     errors: errors.array()
        // })
    }
    if(!req.file){
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    //Create post in db
    // const imageUrl = req.file.path; //use for mac or linux
    const imageUrl = req.file.path.replace("\\", "/"); // use for only window
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
         content: content,
         imageUrl: imageUrl,
          creator: {name: 'PingPong'}
    });
    post.save().then(result => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: result
        });
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;  
    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Post detched.', post: post});
        }).catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file) {
          // imageUrl = req.file.path; //use for mac or linux
        imageUrl = req.file.path.replace("\\", "/"); // use for only window
    }
    if(!imageUrl) {
        const error = new Error('No file picked.')
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    })
    .then(result => {
        res.status(200).json({message: 'Post updated!', post: result});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
        }
        // Check logged in user
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        console.log(result);
        res.status(200).json({message: 'Deleted post.'});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}