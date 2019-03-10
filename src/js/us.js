import {Event_hub,generate_html_tmp,lazy_load} from './common'


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
        this.getData()
        
    }
    
    bind(){
        let _this = this
        this.$container.on('click','.img-wrap',function(){
            _this.event_hub.emit('show_detail',$(this).data('movieId'))
        })
    }

    getData(){
        //获取页面数据
        $('.waterfall').parent().find('.loading').show()
    
        $.ajax({
            // url:'//api.douban.com/v2/movie/us_box',
            url:'//api.douban.com/v2/movie/in_theaters',
            type:'GET',
            dataType:'jsonp',
            
            
        }).done((res)=>{
            this.render(res)
        }).fail((res)=>{
            console.log('请求电影数据失败: ')
            console.log(res)    
        }).always(()=>{
            $('.waterfall').parent().find('.loading').hide()
    
        })
    }
    
     render(data){
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
        this.layout()
    }
    
    layout(){
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




}

export {Us}