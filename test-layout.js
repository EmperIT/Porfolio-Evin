import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 943, height: 959 });
  await page.goto('http://localhost:5173/');
  
  // Wait for loading to finish
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Projects
  await page.evaluate(() => {
    document.querySelector('button[data-planet="projects"]').click();
  });
  
  // Wait for animation
  await new Promise(r => setTimeout(r, 2000));
  
  const rects = await page.evaluate(() => {
    const slider = document.querySelector('.planet-focus-projects__slider');
    const list = document.querySelector('.planet-focus-projects__list');
    const rightArrow = document.querySelector('.planet-focus-projects__nav[data-slider-action="next"]');
    const track = document.querySelector('.planet-focus-projects__track');
    const slide = document.querySelector('.planet-focus-projects__slide');
    const cards = document.querySelectorAll('.planet-focus-projects__slide .planet-focus-project-card');
    
    return {
      slider: slider.getBoundingClientRect(),
      list: list.getBoundingClientRect(),
      rightArrow: rightArrow.getBoundingClientRect(),
      track: track.getBoundingClientRect(),
      slide: slide.getBoundingClientRect(),
      card1: cards[0].getBoundingClientRect(),
      card2: cards[1].getBoundingClientRect(),
      listComputedStyle: {
         marginRight: window.getComputedStyle(list).marginRight,
         paddingRight: window.getComputedStyle(list).paddingRight,
         width: window.getComputedStyle(list).width
      }
    };
  });
  
  console.log(JSON.stringify(rects, null, 2));
  
  await browser.close();
})();
