var express = require('express');
var router = express.Router();

var crypto = require("crypto");
User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: '主页',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash("error").toString()
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
    res.render('reg', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash("error").toString()
    });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
    var name = req.body.name;
    password = req.body.password;
    console.log(req.body)
    password_re = req.body["password_repeat"];
    console.log("password is " + password);
    console.log("password_re is " + password_re);
    console.log(password_re != password);
    //校验用户输入的两次密码是否一致
    if (password_re != password) {
        req.flash("error", "两次输入的密码不一致！");
        return res.redirect("/reg");
    }

    //生成密码的md5值
    var md5 = crypto.createHash("md5");
    password = md5.update(req.body.password).digest("hex");
    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
    });

    //检查用户是否存在
    User.get(newUser.name, function(err, user) {
        if (err) {
            req.flash("error", err);
            return res.redirect("/");
        }
        if (user) {
            req.flash("error", "用户已经存在！");
            return res.redirect("/reg");
        }
        //如果不存在则新增用户
        newUser.save(function(err, user) {
            if (err) {
                req.flash("error", err);
                return res.redirect("/reg");
            }
            console.log("#######");
            console.log(user);
            console.log("#######");
            req.session.user = user;
            req.flash("success", "注册成功!")
            res.redirect("/"); //注册成功后返回首页
        })
    })
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
    res.render('login', {
        title: '登录',
        user: null,
        success: null,
        error: null
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res, next) {
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function(err, user) {
        if (!user) {
            req.flash("error", "用户不存在!");
            return res.redirect("/login");
        }
        //检查密码是否一致
        console.log(user)
        if (user.password != password) {
            req.flash("error", '密码错误!');
            return res.redirect("/login");
        }
        //用户密码匹配后，将信息存入session
        req.session.user = user;
        req.flash("success", "登录成功！");
        res.redirect("/");
    });
});


router.get('/post', checkLogin);
router.get('/post', function(req, res, next) {
    res.render('post', {
        title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash("error").toString()

    });
});

router.post('/post', checkLogin);
router.post('/post', function(req, res, next) {});

router.get('/post', checkLogin);
router.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash("success", "登出成功！");
    res.redirect("/");
});

module.exports = router;

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash("error", "未登录!");
        res.redirect("/login");
    } else {
        next();
    }
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash("error", "已登录");
        res.redirect('back'); //返回之前的页面
    } else {
        next();
    }
}
