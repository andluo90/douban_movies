import './css/style.css'


{
    // // 修复IOS上VH的bug
    let iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true:false;
    if(iOS){
        let main_height = $(window).height() - 50
        $('main').css({height:main_height})
        console.log("IOS上main的height已重置")
    }
}

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



class Top250{
    constructor(){
        this.$container = $('#top250')
        this.is_lodding = false //
        this.moive_index = 0
        this.clock = null
        this.lazy_load_time_id = null
        this.event_hub = Event_hub

        this.data = localStorage.getItem('douban_movies')

    }
    
    init(){

        
        this.bind()
        this.start()
        
    }
    
    bind(){
        let _this = this
        let $main = this.$container.parents('main')
        // 滚动事件
        $main.scroll(()=>{
            if(this.$container.parent().css('display') === 'none'){
                
            }else{
                if(this.clock){
                    clearTimeout(this.clock)
                }
                this.clock = setTimeout(()=>{
                    if(this.$container.height() - 50 <= $main.height()+$main.scrollTop()){
                        console.log("滚动到底部，发起新的请求")
                        this.start()
                    }
                },300)
            }

            if(this.lazy_load_time_id){
                clearTimeout(this.lazy_load_time_id)
            }
            this.lazy_load_time_id = setTimeout(function(){
                lazy_load()
            },500)
            
            
        })  

        //收藏
        this.$container.on('click','.icon-xihuan',function(e){
            let movie_item = $(this).parents('.item')
            let movie_id = movie_item.data('movieId')
            if( $(this).hasClass('active') ){
                $(this).removeClass('active')
                _this.event_hub.emit('unlike',movie_id)
                
            }else{
                $(this).addClass('active')
                let movie_html_str = movie_item.wrap('<p/>').parent().html()
                _this.event_hub.emit('like',{id:movie_id,html:movie_html_str})
            }
            e.stopPropagation()

        })

        //收藏页面取消收藏事件
        this.event_hub.on('fav_unlike',function(movie_id){
            _this.$container.find(`[data-movie-id=${movie_id}] .icon-xihuan`).removeClass('active')
        })

        //查看详情
        this.$container.on('click',":not('.icon-xihuan')",function(e){
            _this.event_hub.emit('show_detail',$(this).parents('.item').data('movieId').toString())
            e.stopPropagation()
        })
        
        

    }
    start(){
        this.getData((data)=>{
            this.render(data)
        })
    }
    
    getData(fn){
        //获取页面数据
        if(this.is_lodding){
            console.log('lodding中，不重新请求数据')
            return
        }else{
            this.is_lodding = true
            this.$container.parent().find('.loading').show()

            $.ajax({
                url:'//api.douban.com/v2/movie/top250',
                type:'GET',
                dataType:'jsonp',
                data: {
                    start:this.moive_index,
                    count:20
                }
                
            }).done((res)=>{
                console.log('请求电影数据成功:')
                fn(res)
                this.moive_index += 20
                console.log(res)
            }).fail((res)=>{
                console.log('请求电影数据失败: ')
                console.log(res)    
            }).always(()=>{
                this.is_lodding = false
                this.$container.parent().find('.loading').hide()
    
            })
        }
    }


    render(data){
        data.subjects.forEach((movie)=>{
             let $node = generate_html_tmp(movie,this.data)
             this.$container.append($node)
        })
        lazy_load()
        
    }
}

class Us{
    constructor(){
        this.$container = $('#us')
        this.col_height_arr = []
        this.event_hub = Event_hub
        this.img_width = $('.waterfall img').outerWidth(true)
        this.col_Count =  Math.floor( $('.waterfall').width()/this.img_width )
        for(let i = 0;i < this.col_Count;i++){
            this.col_height_arr[i] = 0
        }
    }
    
    init(){
        this.bind()
        
    }
    
    bind(){
        let _this = this
        this.$container.on('click','.img-wrap',function(){
            _this.event_hub.emit('show_detail',$(this).data('movieId'))
        })
    }

    layout($node){
        
    }

    start(){
        this.getData((data)=>{
            this.render(data)
        })
       
    }

    getData(fn){
        //获取页面数据

        $.ajax({
            url:'//api.douban.com/v2/movie/us_box',
            type:'GET',
            dataType:'jsonp',
            
            
        }).done((res)=>{
            console.log('请求US电影数据成功:')
            fn(res)
            console.log(res)
        }).fail((res)=>{
            console.log('请求电影数据失败: ')
            console.log(res)    
        })
    }

    render(data){
        data.subjects.forEach((movie)=>{
             movie = movie.subject
             let $node = generate_html_tmp(movie)
             this.$container.append($node)
        })
    }
}


class Search{
    constructor(){
        this.$element = $('#search')
        this.$input = $('#search input')
        this.$container = $('.search-reslut .container')
        this.data = ()=>localStorage.getItem("douban_movies")
        this.event_hub = Event_hub
    }
    
    init(){
        this.bind()
        this.start()
        this.keyword = null;

    }
    
    bind(){

        let _this = this

        this.$container.on('click','.item',function(){
            _this.event_hub.emit('show_detail',$(this).data('movieId'))
        })

        this.$element.find('.button').click(()=>{
            this.keyword = this.$element.find('input').val()
            this.$container.empty()
            this.getData((data)=>{
                this.render(data,this.data())
            })
        })

        //绑定收藏事件
        this.$container.on('click','.icon-xihuan',function(e){
            let item = $(this).parents('.item')
            let movie_id = item.data('movieId')
            if($(this).hasClass('active')){
                console.log("收藏中....")
                $(this).removeClass("active")
                _this.event_hub.emit('unlike',movie_id)
                
            }else{
                console.log("没有收藏...")
                $(this).addClass("active")
                let movie_html_str = item.wrap('<p/>').parent().html()
                _this.event_hub.emit('like',{id:movie_id,html:movie_html_str})


            }
            e.stopPropagation()
        })

        this.event_hub.on('fav_unlike',function(movie_id){
            _this.$container.find(`[data-movie-id=${movie_id}] .icon-xihuan`).removeClass('active')
            console.log(`收藏页面取消收藏事件 成功`)
        })

        // 绑定确认事件
        this.$input.on('keypress',function(e){
            let key_code = e.keyCode;
            _this.keyword = $(this).val();
            if(key_code === 13){
                _this.$container.empty()
                _this.getData((data)=>{
                    _this.render(data,_this.data())
                }) 
            }
        })
            
    }
    start(){
        
    }

    getData(fn){
        //获取页面数据
        if(this.is_lodding){
            console.log('lodding中，不重新请求数据')
            return
        }else{
            this.is_lodding = true
            this.$element.find('.loading').show()

            $.ajax({
                url:'//api.douban.com/v2/movie/search',
                type:'GET',
                dataType:'jsonp',
                data: {
                    q:this.keyword
                }
                
            }).done((res)=>{
                console.log('搜索电影数据成功:')
                fn(res)
                console.log(res)
            }).fail((res)=>{
                console.log('搜索电影数据失败: ')
                console.log(res)    
            }).always(()=>{
                this.is_lodding = false
                this.$element.find('.loading').hide()
    
            })
        }
    }

    render(data,local_data){
        data.subjects.forEach((movie)=>{
             let $node = generate_html_tmp(movie,local_data)
             this.$container.append($node)
        })
        lazy_load()
    }
}


class Favorite {
    constructor(){
        
        this.$container = $('#fav')
        this.local_storage = localStorage
        this.data = this.local_storage.getItem('douban_movies')
        this.event_hub = Event_hub
    }
    init(){
        console.log("初始化")
        if(this.data === null){
            this.data = []
        }else{
            this.data = JSON.parse(this.data)
        }
        this.bind()
        this.render()
    }
    bind(){
        let _this = this

        this.$container.on('click','.icon-xihuan',function(e){
            console.log("取消喜欢...")
            let item = $(this).parents('.item')
            let movie_id = item.data('movieId')
            _this.remove_movie(movie_id)
            _this.event_hub.emit('fav_unlike',movie_id)
            e.stopPropagation()
        })

        this.$container.on('click','.item',function(){
            _this.event_hub.emit('show_detail',$(this).data('movieId'))
        })

        this.event_hub.on('like',function(data){
            console.log(`我监听到了like事件...`)
            _this.data.unshift(data)
            _this.local_storage.setItem('douban_movies',JSON.stringify(_this.data))
        })

        this.event_hub.on('unlike',function(id){
            console.log(`我监听到了unlike事件...`)
            _this.remove_movie(id)

        })

    }

    remove_movie(id){
        let movie_index = null;
            for(let [index,movie] of this.data.entries()){
                if(movie.id === id){
                    movie_index = index
                    break;
                }
            }
        this.data.splice(movie_index,1)
        this.local_storage.setItem('douban_movies',JSON.stringify(this.data))
        this.render()
    }
    
    render(){
        this.$container.empty()
        if(this.data.length === 0){
            console.log("暂无收藏...")
            this.$container.append($('<span class="no-data">暂无收藏哦...</span>'))

        }else{
            let movie_arr = this.data
            movie_arr.forEach((movie)=>{
                this.$container.append($(movie.html))
            })
        }
        
    }
}



class App{
    constructor({top250,us,search,fav,detail}){
        this.$tabs = $('footer>div') //tab按钮
        this.panels = $('section')
        this.top250 = top250
        this.us = us
        this.search = search
        this.fav = fav
        this.detail = detail
        
    }
    init(){
        // 初始化
        this.bind()
        this.top250.init()
        this.us.init()
        this.search.init()
        this.fav.init()
        this.detail.init()
        
    }
    bind(){
        // 绑定事件

        let _this = this
        this.$tabs.click(function(){
            let index = $(this).index()
            _this.panels.hide().eq(index).fadeIn()
            $(this).addClass('active').siblings().removeClass('active')
            if ($(this).data('id') === 'xihuan'){
                _this.fav.render()
            }
            
        })

    }

}

class Detail{
    constructor(){
        this.$container = $('#detail')
        this.$height = $(window).height()
        this.event_hub = Event_hub
        this.data = null
        
        
    }

    init(){
        this.bind()
    }

    bind(){
        this.$container.on('click','.close button',()=>{
            console.log("关闭详情页...")
            this.$container.fadeOut()
        })

        this.event_hub.on('show_detail',(movie_id)=>{
            console.log(movie_id)
            let url = `//api.douban.com/v2/movie/subject/${movie_id}`
            this.get_data(url,()=>{
                this.render()
            })
        })
    }  
    
    get_data(url,render){
        let _this = this
        $.ajax({
            url:url,
            type:'GET',
            dataType:'jsonp',
            data: {
                apikey:'0b2bdeda43b5688921839c8ecb20399b'
            }
            
        }).done((res)=>{
            console.log('请求电影详情数据成功.')
            _this.data = res
            _this.render()
        }).fail((res)=>{
            console.log('请求电影详情数据失败.')
            _this.data = res

        })
    }

    render(){
        let data = this.data
        let meta_directors = ''
        let celebrities = ''
        let meta_casts = ''
        console.log(data)
        let directors = data.directors.map((director)=>{
                console.log(director)
                meta_directors += director.name+'(导演) / '
                celebrities += `<li>
                                    <div class="poster" style="
                                    background-image: url('${director.avatars.small}')"></div>
                                    <span class="name">${director.name}</span>
                                    <span class="role">导演</span>
                                </li>`
        })

        let casts = data.casts.map((cast)=>{
            console.log(cast)
            meta_casts += cast.name+' / '
            celebrities += `<li>
                                    <div class="poster" style="
                                    background-image: url('${cast.avatars.small}')"></div>
                                    <span class="name">${cast.name}</span>
                                    <span class="role">演员</span>
                                </li>`
        })

        let tags = data.tags.map((tag)=>{
            return `<li class="channel_tag"><a href="">${tag}</a></li>`
        })


        let meta = `${data.durations[0]+' / '+data.genres.join(' / ')+' / '+meta_directors+meta_casts+this.data.pubdates.join(' / ')}`

        let tmp = `
        <div class="movie_detail" style="height:${this.$height}px">
            <div class="card">
                <h1>${data.title}</h1>
                <div class="subject">
                    <div class="left">
                        <p class="ratting">
                            <span class="star"></span>
                            <strong class="score">${data.rating.average}</strong>
                            <span class="count">${data.ratings_count}人评价</span>
                        </p>
                        <p class="meta">${meta}
                        </p>
                    </div>
                    <div class="right">
                        <img src="${data.images.small}" alt="">
                    </div>
                </div>
                <div class="channel_tags">
                    <h2>所属频道</h2>
                    <ul>
                        ${tags.join('')}
                    </ul>
                </div>
                <div class="intro">
                    <h2>${data.title}的剧情简介</h2>
                    <p class="bd">
                          ${data.summary}  
                    </p>

                </div>
                <div class="celebrities">
                    <h2>影人</h2>
                    <ul>
                        ${celebrities}        
                    </ul>
                </div>
            </div>
            <div class="close">
                <button>关闭</button>
            </div>
        </div>
        `
        this.$container.empty()
        this.$container.append(tmp).fadeIn()
        console.log("detail 渲染成功...")


    }
}

let app = new App(
    {
        top250:new Top250(),
        us:new Us(),
        search:new Search(),
        fav:new Favorite(),
        detail:new Detail()
        
    }
    ).init()



$('footer>div').eq(1).click(()=>{
    
    if($('.waterfall img').length === 0){
        getData(render)
    }
    
    
})


function getData(fn){
    //获取页面数据
    $('.waterfall').parent().find('.loading').show()

    $.ajax({
        // url:'//api.douban.com/v2/movie/us_box',
        url:'//api.douban.com/v2/movie/in_theaters',
        type:'GET',
        dataType:'jsonp',
        
        
    }).done((res)=>{
        fn(res)
        console.log(res)
    }).fail((res)=>{
        console.log('请求电影数据失败: ')
        console.log(res)    
    }).always(()=>{
        $('.waterfall').parent().find('.loading').hide()

    })
}

function render(data){
    let height_arr = [70,80,90,120]
    data.subjects.forEach((movie)=>{
        //  movie = movie.subject

         let tmp = `
         <div class="img-wrap" data-movie-id=${movie.id}>
            <img src="http://img3.doubanio.com/f/movie/b6dc761f5e4cf04032faa969826986efbecd54bb/pics/movie/movie_default_small.png"  data-src = "${movie.images.small}" alt="">
            <span class="score">${Number(movie.rating.average).toFixed(1)}<span>
         </div>
         `
         
         let $elemnet = $(tmp)
         $elemnet.find('img').css('height',height_arr[Math.floor(Math.random()*4)])
         $('.waterfall').append($elemnet)
    })
    layout()
}

function layout(){
    //瀑布流布局
    let colHeightArray = []
    // let imgWidth = $('.waterfall img').outerWidth(true)
    let imgWidth = $('.waterfall .img-wrap').outerWidth(true)

    let colCount =  Math.floor($('.waterfall').width()/imgWidth)
    for(let i=0; i<colCount; i++){
        colHeightArray[i] = 0
    }
    console.log(`${colHeightArray} ${imgWidth} ${colCount}`)
    $('.waterfall .img-wrap').each(function(){
        let min_value = Math.min(...colHeightArray)
        let min_index = colHeightArray.indexOf(min_value)
        $(this).css({
            left:min_index*imgWidth,
            top:min_value
        })
        colHeightArray[min_index] += $(this).outerHeight(true)
    })

    //懒加载图片
    $('.waterfall img').not('[data-isLoaded]').each(function(){
        if( $('main').height()+$('main').scrollTop() > $(this).offset().top ){
            $(this).attr('src',$(this).attr('data-src'))
            $(this).attr('data-isLoaded',1)
        }
    })

    //居中对齐
    let total_width = $('.waterfall .img-wrap').parents('section').outerWidth(true)
    let imgs_width = $('.waterfall .img-wrap').eq(0).outerWidth(true) * colCount
    let padding = Math.floor( (total_width - imgs_width)/2 )
    $('.waterfall .img-wrap').parents('section').css({'padding-left':padding,'padding-top':padding})
    console.log(`padding-left is ${padding}`)
}



