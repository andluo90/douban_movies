import {Event_hub,generate_html_tmp,lazy_load} from './common'


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

export {Search}
