import {Event_hub,generate_html_tmp,lazy_load} from './common'


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

export {Favorite}