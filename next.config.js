/** @type {import('next').NextConfig} */
const { initGT } = require("gt-next/config");

const withGT = initGT();

module.exports = withGT({
  reactStrictMode: true,
});