import * as React from 'react';
import {TimelineMax, Power0, Cubic} from 'gsap'

import './index.scss';
import {Button} from "../../ui/button";

const heroImage = require('../../../shared/images/hero.svg')


export default class Home extends React.Component {

    private startAnimation = () => {
        const hero : any = document.getElementById("hero");
        if (hero) {
            const svgDocHero = hero.contentDocument;
            if (svgDocHero) {
                const circle1 = svgDocHero.getElementById("circle1");
                const circle2 = svgDocHero.getElementById("circle2");
                const circle3 = svgDocHero.getElementById("circle3");
                const circle4 = svgDocHero.getElementById("circle4");
                const circle5 = svgDocHero.getElementById("circle5");
                const circle6 = svgDocHero.getElementById("circle6");

                const tlHeroC1 = new TimelineMax({repeat: -1});
                const tlHeroC2 = new TimelineMax({repeat: -1});
                const tlHeroC3 = new TimelineMax({repeat: -1});
                const tlHeroC4 = new TimelineMax({repeat: -1});
                const tlHeroC5 = new TimelineMax({repeat: -1});
                const tlHeroC6 = new TimelineMax({repeat: -1});

                tlHeroC1.to(circle1, 5, {
                    rotation: 90,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle1, 5, {
                    rotation: 180,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle1, 3, {
                    rotation: 270,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle1, 3, {
                    rotation: 360,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                });

                tlHeroC2.to(circle2, 6, {
                    rotation: 360,
                    transformOrigin: "center",
                    ease: Cubic.easeIn
                });

                tlHeroC3.to(circle3, 20, {
                    rotation: -360,
                    transformOrigin: "center",
                    ease: Cubic.easeIn
                });

                tlHeroC4.to(circle4, 8, {
                    rotation: 90,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle4, 8, {
                    rotation: 180,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle4, 4, {
                    rotation: 270,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                }).to(circle4, 4, {
                    rotation: 360,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                });

                tlHeroC5.to(circle5, 30, {
                    rotation: -360,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                });

                tlHeroC6.to(circle6, 30, {
                    rotation: 360,
                    transformOrigin: "center",
                    ease: Power0.easeIn
                });
            }
        }
    };

    render() {
        return (
            <div className={'home-wrapper'}>
                <div className={'container'}>
                    <div className={'main-info'}>
                        <h1>Break Solana (the game)</h1>
                        <p>This quick game gives you the chance to break the most performant blockhain in the world.
                            Simply use your keyboard to input as many transactions in a 15 second period.
                            At the end, we will show you how close you came to overhelm the system.</p>
                        <Button name={'Play the game'} linkTo={'/game'}/>
                        <div className={'padding-b'}/>
                        <Button typeALink={true} name={'Read how it works'} linkTo={'https://solana.com/category/blog/'}/>
                    </div>
                    <div className={'hero-illustration'}>
                        <object id={'hero'} data={heroImage} type={'image/svg+xml'} onLoad={this.startAnimation}/>
                    </div>
                </div>
            </div>
        )
    }
}


