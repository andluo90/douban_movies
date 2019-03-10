import './css/style.css'

import {Event_hub,generate_html_tmp,lazy_load} from './js/common'

import {Top250} from './js/top250'
import {Search} from './js/search'
import {Favorite} from './js/favorite'
import {Detail} from './js/detail'
import {Us} from './js/us'

{
    // // 修复IOS上VH的bug
    let iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true:false;
    if(iOS){
        let main_height = $(window).height() - 50
        $('main').css({height:main_height})
        console.log("IOS上main的height已重置")
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



