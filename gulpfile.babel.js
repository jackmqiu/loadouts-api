import fs from 'fs';
import gulp from 'gulp';
import del from 'del';
import dotenv from 'dotenv';
import runSequence from 'run-sequence';
import shell from 'gulp-shell';
import { argv } from 'yargs';

dotenv.config();

const srcPath = './src';
const distPath = './build';
const sourceFiles = `${srcPath}/**/*`;
const tag = argv.tag != undefined ? argv.tag : 'development';

// remove dist
gulp.task('clean', () => del([distPath]));

// translate es6 & pipe to dist
gulp.task('build', shell.task([ `babel ${srcPath} --out-dir ${distPath}/src` ]));

// copy other static files
gulp.task('copy-static', () => gulp.src(['package*.json', 'Dockerfile']).pipe(gulp.dest(`${distPath}/`)));

// dockerize
gulp.task('dockerize', () => {
  shell.task([
    `aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin ${process.env.AWS_DOCKER_REPO}`,
    `docker build -t ${process.env.AWS_ECR} .`,
    `docker tag ${process.env.AWS_ECR}:${tag} ${process.env.AWS_DOCKER_REPO}/${process.env.AWS_ECR}:${tag}`,
    `docker push ${process.env.AWS_DOCKER_REPO}/${process.env.AWS_ECR}:${tag}`
  ], { cwd: distPath })();
}, function(done) {
  done();
});

// clean and pipe all necessary files to dist
gulp.task('build', gulp.series(
  'clean',
  'build',
  'copy-static',
  function (done) {
    done();
}
));

/*
  Dockerize
  run with flag --tag=<major||minor||patch>
  e.g. gulp build-docker --tag=1.2.34
*/
gulp.task('build-docker', gulp.series(
  'build',
  'dockerize',
  function (done) {
    done();
}), function(done) {
  done();
});
