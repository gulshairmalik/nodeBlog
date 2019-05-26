var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id',function(req,res,next){
    var posts = db.get('posts');
    posts.findOne({_id:req.params.id},function(err,post){
        res.render('show',{
            'post':post
        });
    });
});

router.get('/add',function(req,res,next){
    var categories = db.get('categories');
    categories.find({},{},function(err,categories){
        res.render('addpost',{
            "title":"Add Post",
            "categories":categories
        });
    });
});

// Handling Post Request for Posts
router.post('/add' ,function(req,res,next){
    //Get the Form data
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    /*console.log(req.body, 'Body');
    console.log(req.files, 'files');
    res.end();*/

    if(req.files){
        var mainImageOriginalName = req.files[0].originalname;
        var mainImageMime = req.files[0].mimetype;
        var mainImagePath = req.files[0].path;
        var mainImageSize = req.files[0].size;
        var mainImageName = req.files[0].filename;
    }
    else{
        var mainImageName = 'noimage.png';
    }
    //Form Validation
    req.checkBody('title','Title field is required').notEmpty();
    req.checkBody('body','Body field is required').notEmpty();

    //Check Errors
    var errors = req.validationErrors();

    if(errors){
        res.render('addpost',{
            "errors":errors,
            "title":title,
            "body":body
        });
    }else{
        var posts = db.get('posts');
        //Submit Form Data to DB
        posts.insert({
            "title":title,
            "body":body,
            "category":category,
            "date":date,
            "author":author,
            "mainimage":mainImageName
        },function(err,post){
            if(err){
                res.send('There was an issue in submitting the post.');
            }else{
                req.flash('success','Post Submitted Successfully');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

// Handling Post Request for Comments
router.post('/addcomment' ,function(req,res,next){
    //Get the Form data
    var commentName = req.body.commentname;
    var commentBody = req.body.commentbody;
    var postId = req.body.postid;
    var commentDate = new Date();

    //Form Validation
    req.checkBody('commentname','Name field is required').notEmpty();
    req.checkBody('commentbody','Body field is required').notEmpty();

    //Check Errors
    var errors = req.validationErrors();

    if(errors){
        var posts = db.get('posts');
        posts.findOne({_id:postId},function(err,post){
            res.render('show',{
                'errors':errors,
                'post':post
        });
    });
    }else{
        var comment = {'name':commentName,'body':commentBody,'commentdate':commentDate}
        var posts = db.get('posts');
        //Submit Form Data to DB
        posts.update({
                "_id":postId
            },
            {
                $push:{
                    "comments":comment
                }
            },
            function(err,doc){
                if(err){
                    throw err;
                }else{
                    req.flash('success','Comment Added');
                    res.location('/posts/show/'+postId);
                    res.redirect('/posts/show/'+postId);
                }
            }
    );
    }
});

module.exports = router;