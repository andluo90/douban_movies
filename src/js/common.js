let Event_hub= {
    events : {},
    on(type,fn){
        if(this.events[type] ===  undefined){
            this.events[type] = []
        }
        this.events[type].push(fn)
    },
    emit(type,data){
        this.events[type].forEach((fn)=>{
            fn.call(null,data)
        })
    }
}


function generate_html_tmp(movie,local_data){
    // 处理电影json格式数据，生成html模板字符串
    let status = ""
    if(local_data !==  null){
        JSON.parse(local_data).forEach((m)=>{
            if(movie.id === m.id+''){
                status = 'active'
            }
        })
    }
    let {casts,directors} = movie
    let cast_name_arr = []
    let director_name_arr = []
    casts.forEach((cast)=>{
        cast_name_arr.push(cast.name)
    })
    directors.forEach((director)=>{
        director_name_arr.push(director.name)
    })

    let tmp = `            <div class="item" data-movie-id=${movie.id}>
    <a href="#">
        <div class="cover">
            <img src="http://img3.doubanio.com/f/movie/b6dc761f5e4cf04032faa969826986efbecd54bb/pics/movie/movie_default_small.png" data-src = "${movie.images.small}" alt="">
        </div>
        <div class="detail">
            <h2>${movie.title}</h2>
            <div class="extra">
                <span class="score">${movie.rating.average}</span> / ${movie.collect_count}收藏
            </div>
            <div class="extra">${movie.year} / ${movie.genres.join('、')}</div>
            <div class="extra">导演：${director_name_arr.join('、')}</div>
            <div class="extra">主演：${cast_name_arr.join('、')}</div>
            <span class="iconfont icon-xihuan ${status}"></span>

        </div>
    </a>
</div>
`
    return $(tmp)
}

function lazy_load(){
    // 懒加载
    $('.cover img').not('[data-isLoaded]').each(function(){
        if( $('main').height()+$('main').scrollTop() > $(this).offset().top ){
            $(this).attr('src',$(this).attr('data-src'))
            $(this).attr('data-isLoaded',1)
        }
    })
}

export {Event_hub,generate_html_tmp,lazy_load}