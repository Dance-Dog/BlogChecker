// For use with 'await', splits a simple promise into response and error using array destructuring
module.exports.handlePromise = function(promise) {
    return promise
        .then((res) => [ null, res ])
        .catch((err) => [ err ]);
}

// Get epoch milliseconds from timestamp
module.exports.millis = function(time) {
    return new Date(time).getTime() || null;
}

// Clean up messy bits in Hytale's blog formatting
module.exports.cleanExcerpt = function(excerpt) {
    return excerpt.replace(/&rsquo;/g, "'");
}