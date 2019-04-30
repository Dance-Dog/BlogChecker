const request = require("request-promise");

const Discord = require("discord.js");
const app = new Discord.Client();

const config = require("./config");
const pool = require("./db/pool");
const {
    handlePromise,
    millis,
    cleanExcerpt
} = require("./utility");

async function createBlog(blog) {
    const values = [
        blog.slug,
        blog._id,
        blog.featured,
        blog.author,
        blog.title,
        millis(blog.publishedAt),
        millis(blog.createdAt),
        cleanExcerpt(blog.bodyExcerpt),
        JSON.stringify(blog.tags),
        JSON.stringify(blog.coverImage.variants),
        blog.coverImage._id,
        blog.coverImage.s3Key,
        blog.coverImage.mimeType,
        blog.coverImage.attached,
        blog.coverImage.contentType,
        blog.coverImage.contentId,
        millis(blog.coverImage.createdAt),
        blog.coverImage.__v
    ];

    const [ err ] = await handlePromise( pool.query(config.query.CREATE_BLOG, values) );
    if (err) { return console.log("Error adding blog post to DB: " + err); }
    return console.log("Added blog");
}

async function postBlog(blog) {

    const embed = new Discord.RichEmbed();

    embed.setTitle(blog.title);
    embed.setTimestamp(new Date(blog.publishedAt));
    embed.setURL("https://hytale.com/news/0000/1/" + blog.slug);
    embed.setDescription(cleanExcerpt(blog.bodyExcerpt));
    embed.setThumbnail("https://hytale.com/m/variants/blog_thumb_" + blog.coverImage.s3Key);

    embed.setAuthor(
        config.embed.author.name,
        config.embed.author.icon
    );
    embed.setColor(config.embed.color);

    const channel = app.channels.get(config.postChannel);
    const [messageErr, message] = await handlePromise(
        config.tag
            ? channel.send(config.tag, embed)
            : channel.send(embed)
    );
    if (messageErr) { return; }

    // Add reactions
    if (config.embed.reactions.enabled) {
        let i = 0;
        function react() {
            if (!config.embed.reactions.all[i]) { return; }

            message.react(app.emojis.get(config.embed.reactions.all[i]));
            
            i++;
            setTimeout(react, 2000);
        }
        react();
    }
}

async function checkForPosts() {

    if (!app || !pool) { return; }

    console.log("Checking...");

    // Make HTTP request
    const res = await request(config.url.ALL_PUBLISHED);
    let blogs;
    try {
        blogs = JSON.parse(res);
    } catch (err) {
        return;
    }

    // Fetch stored blogs
    const [storedBlogsErr, storedBlogs] = await handlePromise( pool.query(config.query.GET_ALL_BLOGS) );
    if (storedBlogsErr
        || !storedBlogs
        || storedBlogs && !Array.isArray(storedBlogs)
    ) {
        return console.log("Problem fetching stored blogs");
    }

    // Compare response to stored blogs to separate unchecked posts
    const times = [];
    const byTime = {};
    for (const blog of blogs) {
        let isStored = false;
        for (const storedBlog of storedBlogs) {
            if ((storedBlog && blog) && storedBlog.id === blog._id) { isStored = true; }
        }
        if (!isStored) {
            times.push(millis(blog.publishedAt))
            byTime[millis(blog.publishedAt)] = blog;
        }
    }
    if (times.length === 0) { return; }

    times.sort((a, b) => a - b);

    for (const time of times) {
        createBlog(byTime[time]);
    }

    let i = 0;
    function post() {
        if (!times[i]) { return; }

        postBlog(byTime[times[i]]);
        
        i++;
        setTimeout(post, 3000);
    }
    post();
}

app.on("ready", () => {

    console.log("Starting...");

    app.user.setActivity(config.presence.message, { type: config.presence.type });

    setInterval(checkForPosts, config.checkInterval * 1000);

});

app.on("message", (message) => {
    if (message.author.bot || !config.notifRole) { return; }
    
    const member = app.guilds.get(config.postGuild).members.get(message.author.id);
    const hasRole = !!member.roles.get(config.notifRole);

    // Subscribe to alerts
    if (message.content.toLowerCase() === "subscribe") {
        if (hasRole) { return message.author.send("You are already subscribed to Hytale blog alerts!"); }

        member.addRole(config.notifRole);

        message.author.send("You will now recieve Hytale blog alerts! :)");
    }

    // Unsubscribe from alerts
    if (message.content.toLowerCase() === "unsubscribe") {
        if (!hasRole) { return message.author.send("You aren't subscribed to Hytale blog alerts!"); }

        member.removeRole(config.notifRole);

        message.author.send("You will no longer recieve Hytale blog alerts!");
    }
});

app.login(config.token);