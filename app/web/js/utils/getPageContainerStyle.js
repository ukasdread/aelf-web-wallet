/**
 * @file utils/getPageContainerStyle.js
 * @author huangzonghze
 * 10.17
 */
let heightFromMobile = 0;
export default function getPageContainerStyle(resetHeight = false) {
    const ua = navigator.userAgent;
    const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    const isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
    const isAndroid = ua.match(/(Android)\s+([\d.]+)/);
    const isMobile = isIphone || isAndroid;

    let containerStyle = {};
    containerStyle.overflowY = 'scroll';
    containerStyle.overflowX = 'hidden';
    // 判断
    if (isMobile) {
        if (!heightFromMobile || resetHeight) {
          heightFromMobile = document.body.clientHeight - 45;
        }
        containerStyle.height = heightFromMobile;
        containerStyle.WebkitOverflowScrolling = 'touch';
    } else {
      containerStyle.height = document.body.clientHeight - 45;
    }

    return containerStyle;
}