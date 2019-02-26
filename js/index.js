function generate_html_tmp(movie){
    // 处理电影json格式数据，生成html模板字符串
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
    }
    
    init(){
        console.log("init top250")
        this.bind()
        this.start()
        
    }
    
    bind(){
        console.log("开始绑定事件")
        let $main = this.$container.parents('main')
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
             let $node = generate_html_tmp(movie)
             this.$container.append($node)
        })
        console.log("render 结束")
        lazy_load()
        
    }
}

class Us{
    constructor(){
        this.$container = $('#us')
        this.col_height_arr = []
        this.img_width = $('.waterfall img').outerWidth(true)
        this.col_Count =  Math.floor( $('.waterfall').width()/this.img_width )
        for(let i = 0;i < this.col_Count;i++){
            this.col_height_arr[i] = 0
        }
        console.log(this.col_height_arr)
    }
    
    init(){
        console.log("init us")
        this.bind()
        
    }
    
    bind(){
        let _this = this
        $('.waterfall img').on('load',function(){
            // _this.layout($(this))
            console.log(this)
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
        this.$container = $('.search-reslut .container')
    }
    
    init(){
        console.log("init search")
        this.bind()
        this.start()
        this.keyword = null;

    }
    
    bind(){
        this.$element.find('.button').click(()=>{
            this.keyword = this.$element.find('input').val()
            this.$container.empty()
            this.getData((data)=>{
                this.render(data)
            })
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

    render(data){
        data.subjects.forEach((movie)=>{
             let $node = generate_html_tmp(movie)
             this.$container.append($node)
        })
        lazy_load()
    }
}


class App{
    constructor(){
        this.$tabs = $('footer>div') //tab按钮
        this.panels = $('section')
        
    }
    init(){
        // 初始化
        this.bind()
        new Top250().init()
        // new Us().init()
        new Search().init()
        
    }
    bind(){
        let _this = this
        this.$tabs.click(function(){
            let index = $(this).index()
            _this.panels.hide().eq(index).fadeIn()
            $(this).addClass('active').siblings().removeClass('active')
        })
        // 绑定事件

    }

}

new App().init()



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
        console.log('请求US电影数据成功:')
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

         let tmp = `<img src="http://img3.doubanio.com/f/movie/b6dc761f5e4cf04032faa969826986efbecd54bb/pics/movie/movie_default_small.png" data-src = "${movie.images.small}" alt="">`
        //  let tmp = `<img src="${movie.images.small}" data-src = "${movie.images.small}" alt="">`
         let $elemnet = $(tmp)
         $elemnet.css('height',height_arr[Math.floor(Math.random()*4)])
         $('.waterfall').append($elemnet)
    })
    layout()
}

function layout(){
    //瀑布流布局
    let colHeightArray = []
    let imgWidth = $('.waterfall img').outerWidth(true)
    let colCount =  Math.floor($('.waterfall').width()/imgWidth)
    for(let i=0; i<colCount; i++){
        colHeightArray[i] = 0
    }
    console.log(`${colHeightArray} ${imgWidth} ${colCount}`)
    $('.waterfall img').each(function(){
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
    let total_width = $('.waterfall img').parents('section').outerWidth(true)
    let imgs_width = $('.waterfall img').eq(0).outerWidth(true) * colCount
    let padding = Math.floor( (total_width - imgs_width)/2 )
    $('.waterfall img').parents('section').css({'padding-left':padding,'padding-top':padding})
    console.log(`padding-left is ${padding}`)
}



