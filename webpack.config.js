import path from "node:path";
import { fileURLToPath } from "url";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./javascript/main.js",
  output: {
    path: path.resolve(__dirname, "public/dist"),
    filename: process.env.NODE_ENV === "dev" ?
                "dev.bundle.js" :
                "bundle.[contenthash].js"
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      }
    ]
  },
  plugins: [new WebpackManifestPlugin()]
}