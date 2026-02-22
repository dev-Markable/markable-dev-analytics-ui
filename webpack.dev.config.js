const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'target/classes/public/'),
        filename: 'bundle.js',
        libraryTarget: 'umd'
    },

    devServer: {
        static: path.join(__dirname, 'public'),
        compress: true,
        historyApiFallback: true,
        port: 9000,
        host: 'localhost',
        open: true,
        /*
                setupMiddlewares: (middlewares, devServer) => {
                    middlewares.unshift({
                        name: 'inital-data-mw',
                        path: '/api/persons',
                        middleware: (req, res) => res.send([
                            {id: '1', name: 'Привяу'}
                        ])
                      });
                    return middlewares;
                },
        */
        proxy: {
            '/api/*': {
                target: 'http://localhost:7777',
                secure: false,
                changeOrigin: true
            }
        }


    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: f => {
                            let dirNameInsideAssets = path.relative(path.join(__dirname, 'src'), path.dirname(f));
                            return `${dirNameInsideAssets}/[name].[ext]`;
                        }
                    }
                }],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html'
        })
    ]
}