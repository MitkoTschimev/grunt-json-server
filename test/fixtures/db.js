exports.run = function() {
    var data = {}, i = 0;

    data.posts = [];
    while(i < 100) {
        data.posts.push({ id: i, body: 'foo' + i });
        i++;
    }

    return data;
};