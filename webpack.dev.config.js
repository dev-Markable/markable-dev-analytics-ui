const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'target/classes/public/'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        publicPath: '/'
    },

    devServer: {
        static: path.join(__dirname, 'public'),
        compress: true,
        historyApiFallback: {
            // Перенаправляем все запросы, которые не являются статическими файлами, на index.html
            rewrites: [
                {
                    from: /^\/api\/.*$/,
                    to: (context) => context.parsedUrl.pathname
                },
                {
                    from: /^\/bundle\.js$/,
                    to: '/bundle.js'
                },
                {
                    from: /^\/favicon\.ico$/,
                    to: '/favicon.ico'
                },
                {
                    from: /^\/manifest\.json$/,
                    to: '/manifest.json'
                },
                {
                    from: /^\/static\/.*$/,
                    to: (context) => context.parsedUrl.pathname
                },
                {
                    from: /./,
                    to: '/index.html'
                }
            ]
        },
        port: 9000,
        host: 'localhost',
        open: true,
        proxy: {
            '/api/*': {
                target: 'http://localhost:8080',
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
                        },
                        publicPath: '/',
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
            template: 'src/index.html',
            inject: 'body',
        })
    ]
};