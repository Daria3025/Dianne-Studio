import gulp from "gulp";
const { src, dest, watch, series, parallel } = gulp;

import imagemin from "gulp-imagemin"; // мініфікація картинок
import autoprefixer from "gulp-autoprefixer"; // робить автоматичні префікси
import csso from "gulp-csso"; // перевірка і мініфікація вашого CSS
import clean from "gulp-clean"; // для видалення папок або файлов
import dartSass from "sass"; // біблиотека для компіляции SASS файлов для CSS
import gulpSass from "gulp-sass"; // біблиотека для використання бібліотек SASS (пакет в пакете от Олі)
const sass = gulpSass(dartSass); // компіляція стилів (SCSS в CSS)

import bsc from "browser-sync"; // бібліотека-сервер для перевірки вашого проекту
const browserSync = bsc.create(); // визов бібліотеки-сервера

const htmlTaskHandler = () => {
	return src("./src/*.html").pipe(dest("./dist"));
};

const cssTaskHandler = () => {
	return src("./src/scss/main.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(csso())
		.pipe(dest("./dist/css"))
		.pipe(browserSync.stream());
};

const imagesTaskHandler = () => {
	// return src("./src/images/**/*.+(png|jpg|jpeg|svg)")
	return src("./src/images/**/*.*")
		.pipe(imagemin())
		.pipe(dest("./dist/images"));
};

const fontTaskHandler = () => {
	return src("./src/fonts/**/*.*").pipe(dest("./dist/fonts"));
};

const cleanDistTaskHandler = () => {
	return src("./dist", { read: false, allowEmpty: true }).pipe(
		clean({ force: true })
	);
};

const browserSyncTaskHandler = () => {
	browserSync.init({
		server: {
			baseDir: "./dist",
		}
	});

	watch("./src/scss/**/*.scss").on(
		"all",
		series(cssTaskHandler, browserSync.reload)
	);
	watch("./src/*.html").on(
		"change",
		series(htmlTaskHandler, browserSync.reload)
	);
	watch("./src/img/**/*").on(
		"all",
		series(imagesTaskHandler, browserSync.reload)
	);
};

export const cleaning = cleanDistTaskHandler;
export const html = htmlTaskHandler;
export const css = cssTaskHandler;
export const font = fontTaskHandler;
export const images = imagesTaskHandler;

export const build = series(
	cleanDistTaskHandler,
	parallel(htmlTaskHandler, cssTaskHandler, fontTaskHandler, imagesTaskHandler)
);
export const dev = series(build, browserSyncTaskHandler);
