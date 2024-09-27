/** @type {import('next').NextConfig} */
import { initGT } from "gt-next/config";

const withGT = initGT();

export default withGT({
  reactStrictMode: true,
});