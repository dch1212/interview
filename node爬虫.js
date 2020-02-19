//爬虫，优雅的异步编程
// 加载http模块
var http = require('https')
//bluebird是一个第三方的Promise实现
var Promise = require('bluebird')
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的cs
var cheerio = require('cheerio')

// 定义爬虫的目标地址
var baseUrl = 'https://www.imooc.com/learn/'
//var url = 'https://www.imooc.com/learn/348'
//提供具体页面数值，可多个页面爬取数据
var courseIds=[349]


//过滤数据
function filterChapters(html) {
// 沿用JQuery风格
    var $ = cheerio.load(html)
// 通过类名获取章节信息
    var chapters = $('.chapter')
// 课程数据，该数据是一个数组
    var courseData = []

    var courseTitle = $('.hd').find('h2').text().replace(/\s/g,'')
    var courseNumber = $($('.static-item')[2]).find('.meta-value').text().replace(/\s/g,'')

/* 章节信息遍历 */
    chapters.each(function(index,value) {
// 获取单独的每一章
        var chapter = $(this)
// 获取strong标签里面的文本，trim()去除空格，split()分隔成数组，最终只获取章节标题
        var chapterTitle = chapter.find('h3').text().replace(/\s/g,'')
// 获取video标签下的子标签li的内容
        var videos = chapter.find('.video').children('li')
        var chapterData = {
            chapterTitle: chapterTitle,
            videos: []
        }

        videos.each(function(item) {
            var video = $(this)
            var videoTitle = video.text().replace(/\s/g,'').split('开始学习')[0]
            var id=video.find('a').attr('href').split('/')[2].replace(/\s/g,'');
//可能要修改
            var videoData={
                title:videoTitle,
                id:id
            }
            chapterData.videos.push(videoData);
        })
        courseData.push(chapterData)
    })
    var courseObjectData={
        courseTitle:courseTitle,
        courseNumber:courseNumber,
        courseData:courseData
    }
    return courseObjectData
}

//将得到的数据展示出来
function printCourseInfo(coursesData) {
    coursesData.forEach(function(courseData) {
        console.log(courseData.courseNumber + '人学过' + courseData.courseTitle + '\n')
    })
    coursesData.forEach(function(courseData) {
        console.log('###' + courseData.courseTitle + '\n')
        courseData.courseData.forEach(function(item) {
            var chapterTitle = item.chapterTitle
            console.log(chapterTitle + '\n')
            item.videos.forEach(function(video) {
                console.log(' 【' + video.id + '】 ' + video.title + '\n')
            })
        })
    })
}
/*
使用http模块来得到html文档
*/
function getPageAsync(url) {
    return new Promise(function(resolve, reject) { //正确时执行resolve，错误时执行reject
        console.log('正在爬取' + url)

        http.get(url, function(res) {
            var html = ''

            res.on('data', function(data) {
                html += data
            })

            res.on('end', function() {
                resolve(html)
                //              var courseData = filterChapters(html)
                //              printCourseInfo(courseData)
            })
            res.on('error', function(e) {
                reject(e)
                console.log('获取课程数据出错')
            })
        })

    })
}

var fetchCourseArray = []
courseIds.forEach(function(id) {
    fetchCourseArray.push(getPageAsync(baseUrl + id)); //把得到的每个地址放到fetchCourseArray

})

Promise
    .all(fetchCourseArray)
    .then(function(pages) {
        var coursesData = []
        pages.forEach(function(html) {
            var courseData = filterChapters(html)

            coursesData.push(courseData)
        })

        coursesData.sort(function(a, b) {
            return a.number < b.number
        })

        printCourseInfo(coursesData)
})