/**
 * Created by Administrator on 2017/6/8.
 */
var gulp = require('gulp');   //把模块引进来
var $=require('gulp-load-plugins')();  //引用package.json里面的模块

var open = require("open");

var app={
    srcPath:'src/',
    buildPath:'build/',
    distPath:'dist/'
}

//编写任务
gulp.task('jquery', function() {
    // 将你的默认的任务代码放在这
    gulp.src('bower_components/jquery/dist/*.js')
        .pipe(gulp.dest(app.srcPath+'lib/jquery'))
        .pipe(gulp.dest(app.buildPath+'lib/jquery')) //开发环境
        .pipe(gulp.dest(app.distPath+'lib/jquery'))  //生产环境
});

gulp.task('store', function() {
    // 将你的默认的任务代码放在这
    gulp.src('bower_components/store2/dist/*.js')
        .pipe(gulp.dest(app.srcPath+'lib/store2'))
        .pipe(gulp.dest(app.buildPath+'lib/store2')) //开发环境
        .pipe(gulp.dest(app.distPath+'lib/store2'))  //生产环境
});



//压缩图片
gulp.task("imgMin",function () {
    gulp.src(app.srcPath+"images/*")
        .pipe(gulp.dest(app.buildPath+'images'))   //开发环境
        .pipe($.imagemin())  //压缩图片
        .pipe(gulp.dest(app.distPath+'images'))  //生产环境
        .pipe($.connect.reload());
});

//复制music文件
gulp.task("music",function () {
    gulp.src(app.srcPath+"music/*")
        .pipe(gulp.dest(app.buildPath+'music')) //开发环境
        .pipe(gulp.dest(app.distPath+'music'))  //生产环境
});

//复制html文件
gulp.task("html",function () {
    gulp.src(app.srcPath+"*.html")
        .pipe(gulp.dest(app.buildPath))   //开发环境
        .pipe(gulp.dest(app.distPath))   //生产环境
        .pipe($.connect.reload());
});

//复制js文件
gulp.task("js",function () {
    gulp.src(app.srcPath+"js/*.js")
        .pipe($.concat('index.js'))
        .pipe(gulp.dest(app.buildPath+'js'))   //开发环境
        .pipe($.uglify())  //压缩
        .pipe(gulp.dest(app.distPath+'js'))   //生产环境
        .pipe($.connect.reload());
});

//复制css文件
gulp.task("css",function () {
    gulp.src(app.srcPath+"css/*.css")
        .pipe($.concat('index.css'))
        .pipe(gulp.dest(app.buildPath+'css'))   //开发环境
        .pipe($.cssmin())  //压缩
        .pipe(gulp.dest(app.distPath+'css'))   //生产环境
        .pipe($.connect.reload());
});

//删除文件
gulp.task("clear",function () {
    gulp.src([app.buildPath,app.distPath])
        .pipe($.clean());
});

//总的任务
gulp.task("build",['jquery','store','imgMin','html','js','css','music']);


//自动执行，生成http
gulp.task('serve', ['build'], function() {
    $.connect.server({
        root: [app.buildPath],
        livereload: true,
        port: 3154
    });

    open("http://localhost:3154/");

    //监控
    gulp.watch(app.srcPath + '*.html', ['html']);
    gulp.watch(app.srcPath + 'js/*.js', ['js']);
    gulp.watch(app.srcPath + 'css/*.css', ['css']);
    gulp.watch(app.srcPath + 'images/*', ['image']);
});

//默认任务
gulp.task('default', ['serve']);