_ = require 'underscore'
es = require 'event-stream'

Async = require 'async'
gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
install = require 'gulp-install'
mocha = require 'gulp-spawn-mocha'

gulp.task 'build', buildLibraries = ->
  return gulp.src('./src/**/*.coffee')
    .pipe(coffee({header: true})).on('error', gutil.log)
    .pipe(gulp.dest('./lib'))

gulp.task 'watch', ['build'], ->
  return gulp.watch './src/**/*.coffee', -> buildLibraries()

MOCHA_FRAMEWORK_OPTIONS =
  express4: {require: ['test/parameters_express4'], env: {NODE_ENV: 'test'}}
  # express4: {require: ['test/parameters_express4', 'backbone-orm/test/parameters'], env: {NODE_ENV: 'test'}}
  # express3: {require: ['test/parameters_express3', 'backbone-orm/test/parameters'], env: {NODE_ENV: 'test'}}
  # restify: {require: ['test/parameters_restify', 'backbone-orm/test/parameters'], env: {NODE_ENV: 'test'}}

testFn = (options={}) -> (callback) ->
  tags = ("@#{tag.replace(/^[-]+/, '')}" for tag in process.argv.slice(3)).join(' ')
  gutil.log "Running tests for #{options.framework} #{tags}"

  gulp.src("test/spec/**/*.tests.coffee")
  # gulp.src("test/spec/**/cache.tests.coffee")
    .pipe(mocha(_.extend({reporter: 'dot', grep: tags}, MOCHA_FRAMEWORK_OPTIONS[options.framework])))
    .pipe es.writeArray callback
  return # promises workaround: https://github.com/gulpjs/gulp/issues/455

# gulp.task 'test', (callback) ->
gulp.task 'test', ['build', 'install-express3-dependencies'], (callback) ->
  Async.series (testFn({framework: framework_name}) for framework_name of MOCHA_FRAMEWORK_OPTIONS), callback
  return # promises workaround: https://github.com/gulpjs/gulp/issues/455
gulp.task 'test-express4', ['build'], testFn({framework: 'express4'})
gulp.task 'install-express3-dependencies', -> return gulp.src('test/lib/express3/package.json').pipe(install())
gulp.task 'test-express3', ['build', 'install-express3-dependencies'], testFn({framework: 'express3'})
gulp.task 'test-restify', ['build'], testFn({framework: 'restify'})

# gulp.task 'benchmark', ['build'], (callback) ->
#   (require './test/lib/run_benchmarks')(callback)
#   return # promises workaround: https://github.com/gulpjs/gulp/issues/455
