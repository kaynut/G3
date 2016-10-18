var gulp = require('gulp');
gulp.task('default', function() { });



// npm install gulp-concat gulp-rename gulp-uglify --save-dev

var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');  

//script paths
var jsFiles = 'js/**/*.js',  
    jsDest = 'js/dist';

gulp.task('js-dist', function() {  
    return gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});
