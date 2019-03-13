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
        this.search = search
        this.fav = fav
        this.detail = detail
        
    }
    init(){
        // 初始化
        this.bind()
        this.top250.init()
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

            if( index === 1 && $('.waterfall img').length === 0){
                new Us().init() 
            }
            
        })

    }

}


let app = new App(
    {
        top250:new Top250(),
        search:new Search(),
        fav:new Favorite(),
        detail:new Detail()
        
    }
    ).init()








 