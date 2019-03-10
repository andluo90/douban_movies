import {Event_hub,generate_html_tmp,lazy_load} from './common'


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

export {Top250}