// tab 切换
$('footer>div').click(function(){
    let index = $(this).index()
    $('section').hide().eq(index).fadeIn()
    $(this).addClass('active').siblings().removeClass('active')
})

$.ajax({
    url:'//api.douban.com/v2/movie/top250',
    type:'GET',
    dataType:'jsonp',
    data: {
        start:0,
        count:20
    }
    
}).done(function(res){
    console.log('请求成功:')
    setData(res)
    console.log(res)
}).fail(function(res){
    console.log('请求失败: ')
    console.log(res)    
})

function setData(data){
    data.subjects.forEach((movie)=>{
        let tmp = `            <div class="item">
        <a href="#">
            <div class="cover">
                <img src="${movie.images.small}" alt="">
            </div>
            <div class="detail">
                <h2>${movie.title}</h2>
                <div class="extra">
                    <span class="score">${movie.rating.average}</span> / ${movie.collect_count}收藏
                </div>
                <div class="extra">${movie.year} / 剧情、爱情</div>
                <div class="extra">导演：张艺谋</div>
                <div class="extra">主演：张艺、张艺谋、张艺谋</div>

            </div>
        </a>
    </div>
`
         $node = $(tmp)
         $('section').eq(0).append($node)
    })
}