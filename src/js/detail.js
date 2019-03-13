import {Event_hub,generate_html_tmp,lazy_load} from './common'

class Detail{
    constructor(){
        this.$container = $('#detail')
        this.$height = $(window).height()
        this.$width = $(window).width()
        this.$left = this.$container.css({left:this.$width})
        this.event_hub = Event_hub
        this.data = null
        
        
    }

    init(){
        this.bind()
    }

    bind(){
        this.$container.on('click','.close button',()=>{
            console.log("关闭详情页...")
            this.$container.css({left:this.$width})

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
        this.$container.append(tmp).css({left:0})
        console.log("detail 渲染成功...")


    }
}


export {Detail}
