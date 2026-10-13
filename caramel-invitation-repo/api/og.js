// 카톡 링크 미리보기 이미지(1200x630): 첫 장 타이틀을 가운데 살짝 아래로 배치
const sharp=require('sharp'),fs=require('fs'),path=require('path');
function readCover(){for(const p of [path.join(__dirname,'..','images','invitation-1.jpg'),path.join(process.cwd(),'images','invitation-1.jpg')]){try{return fs.readFileSync(p);}catch(e){}}return null;}
async function build(buf){
const meta=await sharp(buf).metadata();const k=meta.width/640;const R=v=>Math.round(v*k);
const W=1200,H=630;
const bg=await sharp(buf).extract({left:0,top:R(60),width:meta.width,height:R(336)}).resize(W,H).blur(18).toBuffer();
const fgW=Math.round(640*H/385),p=(60/fgW).toFixed(3);
const fgRaw=await sharp(buf).extract({left:0,top:R(95),width:meta.width,height:R(385)}).resize(fgW,H).ensureAlpha().png().toBuffer();
const mask=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${fgW}" height="${H}"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${p}" stop-color="#fff"/><stop offset="${1-p}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="${fgW}" height="${H}" fill="url(#g)"/></svg>`);
const fg=await sharp(fgRaw).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
return sharp(bg).composite([{input:fg,left:Math.round((W-fgW)/2),top:0}]).jpeg({quality:85}).toBuffer();}
module.exports=async(req,res)=>{const buf=readCover();
if(!buf){res.statusCode=302;res.setHeader('Location','/images/invitation-1.jpg');return res.end();}
try{const out=await build(buf);res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','public, max-age=86400, s-maxage=31536000');res.end(out);}
catch(e){console.error('og error',e);res.statusCode=302;res.setHeader('Location','/images/invitation-1.jpg');res.end();}};
module.exports.build=build;
