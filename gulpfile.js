const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('default', () => 
    gulp.src([
      './input.js',
      './scraper.js',
      './package.json'
    ])
        .pipe(zip('scraper.zip'))
        .pipe(gulp.dest('./'))
);
