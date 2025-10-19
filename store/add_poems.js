const { supabase } = require('./services/supabase.js');

// 30首各种分类的古诗数据
const poemsData = [
  // 唐诗 (10首)
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    form: '五言绝句',
    content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
    tags: ['春天', '写景', '唐诗']
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    form: '五言绝句',
    content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
    tags: ['登高', '写景', '唐诗']
  },
  {
    title: '相思',
    author: '王维',
    dynasty: '唐',
    form: '五言绝句',
    content: '红豆生南国，春来发几枝。\n愿君多采撷，此物最相思。',
    tags: ['相思', '爱情', '唐诗']
  },
  {
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    form: '五言绝句',
    content: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。',
    tags: ['冬天', '写景', '唐诗']
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    form: '七言绝句',
    content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。',
    tags: ['山水', '写景', '唐诗']
  },
  {
    title: '黄鹤楼送孟浩然之广陵',
    author: '李白',
    dynasty: '唐',
    form: '七言绝句',
    content: '故人西辞黄鹤楼，烟花三月下扬州。\n孤帆远影碧空尽，唯见长江天际流。',
    tags: ['送别', '友情', '唐诗']
  },
  {
    title: '枫桥夜泊',
    author: '张继',
    dynasty: '唐',
    form: '七言绝句',
    content: '月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。',
    tags: ['夜晚', '思乡', '唐诗']
  },
  {
    title: '春夜喜雨',
    author: '杜甫',
    dynasty: '唐',
    form: '五言律诗',
    content: '好雨知时节，当春乃发生。\n随风潜入夜，润物细无声。\n野径云俱黑，江船火独明。\n晓看红湿处，花重锦官城。',
    tags: ['春天', '雨', '唐诗']
  },
  {
    title: '游子吟',
    author: '孟郊',
    dynasty: '唐',
    form: '五言古诗',
    content: '慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。',
    tags: ['母爱', '亲情', '唐诗']
  },
  {
    title: '出塞',
    author: '王昌龄',
    dynasty: '唐',
    form: '七言绝句',
    content: '秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。',
    tags: ['边塞', '战争', '唐诗']
  },

  // 宋词 (10首)
  {
    title: '水调歌头·明月几时有',
    author: '苏轼',
    dynasty: '宋',
    form: '词',
    content: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。\n起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。\n不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，此事古难全。\n但愿人长久，千里共婵娟。',
    tags: ['中秋', '思念', '宋词']
  },
  {
    title: '声声慢·寻寻觅觅',
    author: '李清照',
    dynasty: '宋',
    form: '词',
    content: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。\n乍暖还寒时候，最难将息。\n三杯两盏淡酒，怎敌他、晚来风急？\n雁过也，正伤心，却是旧时相识。\n满地黄花堆积。憔悴损，如今有谁堪摘？\n守着窗儿，独自怎生得黑？\n梧桐更兼细雨，到黄昏、点点滴滴。\n这次第，怎一个愁字了得！',
    tags: ['愁绪', '思念', '宋词']
  },
  {
    title: '青玉案·元夕',
    author: '辛弃疾',
    dynasty: '宋',
    form: '词',
    content: '东风夜放花千树，更吹落、星如雨。\n宝马雕车香满路。\n凤箫声动，玉壶光转，一夜鱼龙舞。\n蛾儿雪柳黄金缕，笑语盈盈暗香去。\n众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。',
    tags: ['元宵', '爱情', '宋词']
  },
  {
    title: '雨霖铃·寒蝉凄切',
    author: '柳永',
    dynasty: '宋',
    form: '词',
    content: '寒蝉凄切，对长亭晚，骤雨初歇。\n都门帐饮无绪，留恋处，兰舟催发。\n执手相看泪眼，竟无语凝噎。\n念去去，千里烟波，暮霭沉沉楚天阔。\n多情自古伤离别，更那堪，冷落清秋节！\n今宵酒醒何处？杨柳岸，晓风残月。\n此去经年，应是良辰好景虚设。\n便纵有千种风情，更与何人说？',
    tags: ['离别', '思念', '宋词']
  },
  {
    title: '念奴娇·赤壁怀古',
    author: '苏轼',
    dynasty: '宋',
    form: '词',
    content: '大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。\n乱石穿空，惊涛拍岸，卷起千堆雪。\n江山如画，一时多少豪杰。\n遥想公瑾当年，小乔初嫁了，雄姿英发。\n羽扇纶巾，谈笑间，樯橹灰飞烟灭。\n故国神游，多情应笑我，早生华发。\n人生如梦，一尊还酹江月。',
    tags: ['怀古', '赤壁', '宋词']
  },
  {
    title: '满江红·怒发冲冠',
    author: '岳飞',
    dynasty: '宋',
    form: '词',
    content: '怒发冲冠，凭栏处、潇潇雨歇。\n抬望眼，仰天长啸，壮怀激烈。\n三十功名尘与土，八千里路云和月。\n莫等闲、白了少年头，空悲切！\n靖康耻，犹未雪。臣子恨，何时灭！\n驾长车，踏破贺兰山缺。\n壮志饥餐胡虏肉，笑谈渴饮匈奴血。\n待从头、收拾旧山河，朝天阙。',
    tags: ['爱国', '壮志', '宋词']
  },
  {
    title: '蝶恋花·庭院深深深几许',
    author: '欧阳修',
    dynasty: '宋',
    form: '词',
    content: '庭院深深深几许，杨柳堆烟，帘幕无重数。\n玉勒雕鞍游冶处，楼高不见章台路。\n雨横风狂三月暮，门掩黄昏，无计留春住。\n泪眼问花花不语，乱红飞过秋千去。',
    tags: ['春愁', '思念', '宋词']
  },
  {
    title: '浣溪沙·一曲新词酒一杯',
    author: '晏殊',
    dynasty: '宋',
    form: '词',
    content: '一曲新词酒一杯，去年天气旧亭台。\n夕阳西下几时回？\n无可奈何花落去，似曾相识燕归来。\n小园香径独徘徊。',
    tags: ['时光', '感慨', '宋词']
  },
  {
    title: '卜算子·咏梅',
    author: '陆游',
    dynasty: '宋',
    form: '词',
    content: '驿外断桥边，寂寞开无主。\n已是黄昏独自愁，更著风和雨。\n无意苦争春，一任群芳妒。\n零落成泥碾作尘，只有香如故。',
    tags: ['梅花', '咏物', '宋词']
  },
  {
    title: '鹊桥仙·纤云弄巧',
    author: '秦观',
    dynasty: '宋',
    form: '词',
    content: '纤云弄巧，飞星传恨，银汉迢迢暗度。\n金风玉露一相逢，便胜却人间无数。\n柔情似水，佳期如梦，忍顾鹊桥归路。\n两情若是久长时，又岂在朝朝暮暮。',
    tags: ['七夕', '爱情', '宋词']
  },

  // 元曲 (5首)
  {
    title: '天净沙·秋思',
    author: '马致远',
    dynasty: '元',
    form: '曲',
    content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。\n夕阳西下，断肠人在天涯。',
    tags: ['秋思', '思乡', '元曲']
  },
  {
    title: '山坡羊·潼关怀古',
    author: '张养浩',
    dynasty: '元',
    form: '曲',
    content: '峰峦如聚，波涛如怒，山河表里潼关路。\n望西都，意踌躇。\n伤心秦汉经行处，宫阙万间都做了土。\n兴，百姓苦；亡，百姓苦。',
    tags: ['怀古', '民生', '元曲']
  },
  {
    title: '天净沙·春',
    author: '白朴',
    dynasty: '元',
    form: '曲',
    content: '春山暖日和风，阑干楼阁帘栊，杨柳秋千院中。\n啼莺舞燕，小桥流水飞红。',
    tags: ['春天', '写景', '元曲']
  },
  {
    title: '水仙子·夜雨',
    author: '徐再思',
    dynasty: '元',
    form: '曲',
    content: '一声梧叶一声秋，一点芭蕉一点愁，三更归梦三更后。\n落灯花棋未收，叹新丰孤馆人留。\n枕上十年事，江南二老忧，都到心头。',
    tags: ['夜雨', '思乡', '元曲']
  },
  {
    title: '沉醉东风·渔夫',
    author: '白朴',
    dynasty: '元',
    form: '曲',
    content: '黄芦岸白蘋渡口，绿杨堤红蓼滩头。\n虽无刎颈交，却有忘机友，点秋江白鹭沙鸥。\n傲杀人间万户侯，不识字烟波钓叟。',
    tags: ['渔夫', '隐逸', '元曲']
  },

  // 明清诗词 (5首)
  {
    title: '石灰吟',
    author: '于谦',
    dynasty: '明',
    form: '七言绝句',
    content: '千锤万凿出深山，烈火焚烧若等闲。\n粉骨碎身浑不怕，要留清白在人间。',
    tags: ['咏物', '气节', '明诗']
  },
  {
    title: '己亥杂诗',
    author: '龚自珍',
    dynasty: '清',
    form: '七言绝句',
    content: '九州生气恃风雷，万马齐喑究可哀。\n我劝天公重抖擞，不拘一格降人才。',
    tags: ['政治', '人才', '清诗']
  },
  {
    title: '竹石',
    author: '郑燮',
    dynasty: '清',
    form: '七言绝句',
    content: '咬定青山不放松，立根原在破岩中。\n千磨万击还坚劲，任尔东西南北风。',
    tags: ['咏物', '气节', '清诗']
  },
  {
    title: '长相思·山一程',
    author: '纳兰性德',
    dynasty: '清',
    form: '词',
    content: '山一程，水一程，身向榆关那畔行，夜深千帐灯。\n风一更，雪一更，聒碎乡心梦不成，故园无此声。',
    tags: ['思乡', '边塞', '清词']
  },
  {
    title: '村居',
    author: '高鼎',
    dynasty: '清',
    form: '七言绝句',
    content: '草长莺飞二月天，拂堤杨柳醉春烟。\n儿童散学归来早，忙趁东风放纸鸢。',
    tags: ['春天', '田园', '清诗']
  }
];

async function addPoems() {
  try {
    console.log('开始添加古诗数据...');
    
    // 检查是否已有数据
    const { data: existingPoems, error: checkError } = await supabase
      .from('poems')
      .select('title, author')
      .limit(1);
    
    if (checkError) {
      console.error('检查数据错误:', checkError);
      return;
    }
    
    console.log(`当前已有 ${existingPoems?.length || 0} 首古诗`);
    
    // 批量插入数据
    const { data, error } = await supabase
      .from('poems')
      .insert(poemsData)
      .select();
    
    if (error) {
      console.error('插入数据错误:', error);
      return;
    }
    
    console.log(`成功添加 ${data.length} 首古诗到数据库！`);
    console.log('添加的古诗分类统计:');
    
    const dynastyStats = poemsData.reduce((acc, poem) => {
      acc[poem.dynasty] = (acc[poem.dynasty] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(dynastyStats).forEach(([dynasty, count]) => {
      console.log(`  ${dynasty}: ${count} 首`);
    });
    
  } catch (error) {
    console.error('添加古诗数据失败:', error);
  }
}

addPoems();