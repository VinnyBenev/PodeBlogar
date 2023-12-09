const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
    cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()*"_"+file.originalname)
    }
});

var upload = multer({
    storage: storage,
}).single('image');

router.get('/index', (req,res)=>{
    res.render('add', {title: 'Adicionar Post'})
})

router.get('/edit', (req, res)=>{
    res.render("edit", {title: 'Editar post'})
})

//inserir um post no banco
router.post('/index', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
        }

        const post = new Post({
            name: req.body.name,
            content: req.body.content,
            image: req.file.filename
        });

        await post.save();
        
        req.session.message = {
            type: 'success',
            message: 'Post Adicionado!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//mostrar todos os posts
router.get('/', (req, res) => {
    Post.find().exec()
        .then(posts => {
            res.render('index', {
                title: "Início",
                posts: posts,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

//ir editar posts
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const post = await Post.findById(id).exec();

        if (!post) {
            return res.redirect('/');
        }

        res.render('edit', {
            title: 'Editar Posts',
            post: post,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

//atualizar imagem dos posts 
router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;

            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.error(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await Post.findByIdAndUpdate(id, {
            name: req.body.name,
            content: req.body.content,
            image: new_image,
        }).exec();

        req.session.message = {
            type: 'success',
            message: 'Post atualizado com sucesso!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//deletar posts
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const result = await Post.findOneAndDelete({ _id: id }).exec();

        if (result && result.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.error(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'Post deletado!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;