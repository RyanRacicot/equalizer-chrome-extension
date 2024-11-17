module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Exclude runtime chunk from build for Chrome extension
            if (process.env.INLINE_RUNTIME_CHUNK === "false") {
                webpackConfig.optimization.runtimeChunk = false
            }

            return webpackConfig
        },
    },
    style: {
        modules: {
            localIdentName: "[local]_[hash:base64:5]",
        },
    },
}
