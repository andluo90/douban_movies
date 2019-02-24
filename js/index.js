// tab 切换
$('footer>div').click(function(){
    let index = $(this).index()
    $('section').hide().eq(index).fadeIn()
    $(this).addClass('active').siblings().removeClass('active')
})

let moive_index = 0;
let is_lodding = false;

function get_movies_data(){
    if(is_lodding){
        console.log('lodding中，不重新请求数据')
        return
    }else{
        is_lodding = true
        $('.loading').show()
        $.ajax({
            url:'//api.douban.com/v2/movie/top250',
            type:'GET',
            dataType:'jsonp',
            data: {
                start:moive_index,
                count:20
            }
            
        }).done(function(res){
            console.log('请求电影数据成功:')
            setData(res)
            moive_index += 20
            console.log(res)
        }).fail(function(res){
            console.log('请求电影数据失败: ')
            console.log(res)    
        }).always(function(){
            is_lodding = false
            $('.loading').hide()

        })
    }
}

get_movies_data()

let clock = null

$('main').scroll(function(){
    if(clock){
        clearTimeout(clock)
    }
    clock = setTimeout(function(){
        if($('section').eq(0).height() - 50 <= $('main').height()+$('main').scrollTop()){
            console.log("滚动到底部，发起新的请求")
            get_movies_data(moive_index)
        }
    },300)
    
})

function setData(data){
    data.subjects.forEach((movie)=>{
        let {casts,directors} = movie
        let cast_name_arr = []
        let director_name_arr = []
        casts.forEach((cast)=>{
            cast_name_arr.push(cast.name)
        })
        directors.forEach((director)=>{
            director_name_arr.push(director.name)
        })

        let tmp = `            <div class="item">
        <a href="#">
            <div class="cover">
                <img src="${movie.images.medium}" alt="">
            </div>
            <div class="detail">
                <h2>${movie.title}</h2>
                <div class="extra">
                    <span class="score">${movie.rating.average}</span> / ${movie.collect_count}收藏
                </div>
                <div class="extra">${movie.year} / ${movie.genres.join('、')}</div>
                <div class="extra">导演：${director_name_arr.join('、')}</div>
                <div class="extra">主演：${cast_name_arr.join('、')}</div>

            </div>
        </a>
    </div>
`
         $node = $(tmp)
         $('#top250').append($node)
    })
}