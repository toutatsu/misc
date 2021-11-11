//var title=document.querySelector("#page-manager > ytd-watch-flexy")

var player_theater_container=document.querySelector("#player-theater-container")

//var player=document.querySelector("#player")


// var video_width=document.querySelector("#movie_player > div.html5-video-container > video").style.width
// console.log(video_width)
WIDTH=document.body.scrollWidth
HEIGHT=100

var wave = document.createElement("canvas");
wave.className='wave'
wave.setAttribute("width",WIDTH);
wave.setAttribute("height",HEIGHT);
document.querySelector("#page-manager > ytd-watch-flexy").insertBefore(wave, player_theater_container.nextSibling);


var fft = document.createElement("canvas");
fft.className='fft'
fft.setAttribute("width",WIDTH);
fft.setAttribute("height",HEIGHT);
document.querySelector("#page-manager > ytd-watch-flexy").insertBefore(fft, wave.nextSibling);



// var piano = document.createElement("canvas");
// piano.className='piano'
// //piano.setAttribute("id","piano"); // p要素にidを設定
// piano.style.position='relative'
// // piano.style.width=WIDTH
// // piano.style.height=HEIGHT
// piano.setAttribute("width",WIDTH);
// piano.setAttribute("height",HEIGHT);
// //piano.appendChild(document.createTextNode("GOMA"))

// document.querySelector("#page-manager > ytd-watch-flexy").insertBefore(piano, fft.nextSibling);




var piano = document.createElement("div");
piano.style.position='relative'
piano.setAttribute("id","piano"); // p要素にidを設定
piano.style.width=WIDTH+'px'
piano.style.height=HEIGHT+'px'
piano.style.backgroundColor='red'


document.querySelector("#page-manager > ytd-watch-flexy").insertBefore(piano, fft.nextSibling);





var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var source = audioCtx.createMediaElementSource(document.querySelector('video'));

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;



var wavecanvasCtx = wave.getContext("2d");
var fftcanvasCtx = fft.getContext("2d");
//var pianocanvasCtx = piano.getContext("2d");


//sine wave



analyser.fftSize = 1024*8;
var bufferLength = analyser.fftSize;
console.log(bufferLength);
var dataArray = new Uint8Array(bufferLength);

wavecanvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

source.connect(analyser)

var gainNode = audioCtx.createGain();
gainNode.gain.value = 0.4;
analyser.connect(gainNode);


// <div class="slidecontainer">
//   <input type="range" min="1" max="100" value="50" class="slider" id="myRange">
// </div>

// slider.oninput = function() {
//     gainNode.gain.value = this.value;
//   }




gainNode.connect(audioCtx.destination);



//visualize();



var draw = function() {

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);


    wavecanvasCtx.fillStyle = 'rgb(30, 0, 0)';
    wavecanvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    wavecanvasCtx.lineWidth = 2;
    wavecanvasCtx.strokeStyle = 'rgb(255, 100, 100)';

    wavecanvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 /bufferLength;

    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
        
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;

        if(i === 0 || i === bufferLength-1) {
            wavecanvasCtx.moveTo(x, y);
        } else {
            wavecanvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    wavecanvasCtx.lineTo(document.querySelector('.wave').width, document.querySelector('.wave').height/2);
    wavecanvasCtx.stroke();
};


draw();




//https://www.geidai.ac.jp/~marui/r_program/midicent.html

var freq2midicent =function(freq, pitch=440) {
    // Convert frequency (Hz) to MIDI cent value (MIDI note number times
    // 100 for representing partial pitch).
    return(Math.log2(freq/pitch)*1200+6900)
}

  
var midicent2freq = function(midicent, pitch=440) {
    // Convert MIDI cent value (MIDI note number times 100 for
    // representing partial pitch) to frequency (Hz).
    return(pitch * 2**((midicent-6900)/1200))
}




  //fft


youtube_samplerate=44100

var bin2freq=Array(analyser.frequencyBinCount)

for(var i=0;i<analyser.frequencyBinCount;i++){
    bin2freq[i]=((youtube_samplerate/2)/(analyser.frequencyBinCount-1))*i
}
console.log(bin2freq)
// analyser.fftSize = 256;
var bufferLengthAlt = analyser.frequencyBinCount/8;
console.log(bufferLengthAlt);
var dataArrayAlt = new Uint8Array(bufferLengthAlt);

fftcanvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

var drawfft = function() {
    drawVisual = requestAnimationFrame(drawfft);

    analyser.getByteFrequencyData(dataArrayAlt);

    // for(var i = 0;i<bufferLengthAlt;i++){
    //     //if (bin2freq[i]%100==0)dataArrayAlt[i]=100
    //     if (bin2freq[i]%1000<100)dataArrayAlt[i]=100
    //     if (bin2freq[i]%10000<100)dataArrayAlt[i]=150
    // }
    // dataArrayAlt[bufferLengthAlt-1]=255


    fftcanvasCtx.fillStyle = 'rgb(0, 0, 0)';
    fftcanvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = (WIDTH/bufferLengthAlt) ;
    var barHeight;
    var x = 0;

    color12=[
        'rgb(230,0  ,18 )',
        'rgb(243,152,0  )',
        'rgb(255,251,0	)',
        'rgb(143,195,31	)',
        'rgb(0  ,153,68 )',
        'rgb(0  ,158,150)',
        'rgb(0  ,160,233)',
        'rgb(0  ,104,183)',
        'rgb(29 ,32 ,136)',
        'rgb(146,7  ,131)',
        'rgb(228,0  ,127)',
        'rgb(229,0  ,79 )',
    ]

    for(var i = 0; i < bufferLengthAlt; i++) {
        barHeight = dataArrayAlt[i];

       
        fftcanvasCtx.fillStyle = color12[Math.round(freq2midicent(bin2freq[i])/100)%12]//'rgb(' + (barHeight+100) + ',50,50)';
        fftcanvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
        x += barWidth;
    }
}
drawfft();


//piano
// pianocanvasCtx.fillStyle = 'rgb(255, 255, 255)';
// pianocanvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

// pianocanvasCtx.strokeStyle = 'rgb(0, 0, 0)';
// pianocanvasCtx.lineWidth = 1;
// pianocanvasCtx.beginPath();
// pianocanvasCtx.rect(20, 20, 150, 100);
// pianocanvasCtx.stroke();

//piano.innerText='GOMA'
keywidth=WIDTH/52

const black_key_position=[1,3,6,8,10]
var white_count=0

var sound=Array(88)
var is_mousedown=Array(88)
for(var i=21;i<21+88;i++){

    octave = String(Math.floor(i/12)-2);
    
    note = "c csd dse f fsg gsa asb ".substr((i%12)*2,2);
    if(note[1]==' ')note=note[0];



    https://github.com/ledlamp/piano-sounds/blob/master/Emotional/a0.mp3
    
    sound[parseInt(i)-21]=new Audio("https://raw.githubusercontent.com/ledlamp/piano-sounds/master/Emotional/"+note+octave+".mp3");
    //new Audio("file:///C:/Users/toutatsu/Desktop/youtube_sound/piano-sounds-master/Emotional/"+note+octave+".mp3");
    //

    sound[parseInt(i)-21].volume=0.5;

    
    
    var key=document.createElement("button")
    key.setAttribute('id',String(i))
    
    key.style.position='absolute'; 
    key.style.top='0px';


    key.onmousedown=function(e){

        /// 要素IDを取得する
        var e = e || window.event;
        var elem = e.target || e.srcElement;

        console.log(elem.id+' note mousedown')

        sound[parseInt(elem.id)-21].play();

        is_mousedown[parseInt(elem.id)-21]=true
    }

    key.onmouseup=function(e){

        /// 要素IDを取得する
        var e = e || window.event;
        var elem = e.target || e.srcElement;

        console.log(elem.id+' note mouseup')

        sound[parseInt(elem.id)-21].pause();

        sound[parseInt(elem.id)-21].currentTime=0;

        is_mousedown[parseInt(elem.id)-21]=false


    }





    if(black_key_position.includes(i%12)){
        key.style.width=+keywidth*0.9+'px'//keywidth
        key.style.backgroundColor = 'black'
        key.style.height=(HEIGHT*0.6)+'px'//HEIGHT
        key.style.left=((keywidth*white_count)-(keywidth*0.9)/2)+'px';
        key.style.zIndex='2'
    }
    else{
        key.style.width=+keywidth+'px'//keywidth
        key.style.backgroundColor = 'white'
        key.style.height=HEIGHT+'px'//HEIGHT
        key.style.left=(keywidth*white_count)+'px';
        key.style.zIndex='1'
        white_count++;
    }

    piano.appendChild(key); // p要素にテキストノードを追加z
    
    // pianocanvasCtx.fillRect(keywidth*i, 0, keywidth*(i+1), HEIGHT);
    // pianocanvasCtx.rect(keywidth*i, 0, keywidth*(i+1), HEIGHT);

}

//pianocanvasCtx.stroke();


// for(var i=0;i<bufferLengthAlt;i++){
//     console.log(freq2midicent(bin2freq[i]))
// }
// def note_frequency(note):
//     return 13.75*(2**((note-9)/12))


// note=[note_frequency(0)*(2**((2*i-1)/(12*2))) for i in range(0,129)]

// for i in range(128):
//     print(i,":",note[i],"-",note[i+1])


console.log('========')





var midi_level=new Uint16Array(128)
var midi_level_cnt=new Uint8Array(128)

//[21-108] piano

// console.log(midi_level)
// console.log(midi_level_cnt)


console.log(midi_level_cnt)

for(var i=0;i<bufferLengthAlt;i++){
    midi_level_cnt[Math.round(freq2midicent(bin2freq[i])/100)]++;
}

var drawpianocolor = function() {

    midi_level.fill(0)


    for(var i=0;i<bufferLengthAlt;i++){

        midi_level[Math.round(freq2midicent(bin2freq[i])/100)]+=dataArrayAlt[i];
    }


    drawVisual = requestAnimationFrame(drawpianocolor);
    for(var i = 21;i<21+88;i++){
        level=midi_level[i]/midi_level_cnt[i]

        
        if(level>80){
            document.getElementById(String(i)).style.backgroundColor=black_key_position.includes(i%12)?'rgb('+level+',0,0)':'rgb(255,'+(255-level)+','+(255-level)+')';
            if(sound[parseInt(i)-21].currentTime==0)sound[parseInt(i)-21].play();
        }
        else{
            document.getElementById(String(i)).style.backgroundColor=black_key_position.includes(i%12)?'black':'white';
            if(!is_mousedown[parseInt(i)-21] &&sound[parseInt(i)-21].currentTime!=0){
                sound[parseInt(i)-21].pause();
                sound[parseInt(i)-21].currentTime=0;
            }
        }
    }

}
drawpianocolor();

