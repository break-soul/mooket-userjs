// ==UserScript==
// @name         mooket
// @namespace    http://tampermonkey.net/
// @version      20250403.20974
// @description  银河奶牛历史价格 show history market data for milkywayidle
// @author       IOMisaka
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @connect      mooket.qi-e.top
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js
// @license MIT
// ==/UserScript==


(function () {
  'use strict';

  let itemNamesCN = {
    '/items/coin': '金币',
    '/items/task_token': '任务代币',
    '/items/chimerical_token': '奇幻代币',
    '/items/sinister_token': '阴森代币',
    '/items/enchanted_token': '秘法代币',
    '/items/cowbell': '牛铃',
    '/items/bag_of_10_cowbells': '牛铃袋 (10个)',
    '/items/purples_gift': '小紫牛的礼物',
    '/items/small_meteorite_cache': '小陨石舱',
    '/items/medium_meteorite_cache': '中陨石舱',
    '/items/large_meteorite_cache': '大陨石舱',
    '/items/small_artisans_crate': '小工匠匣',
    '/items/medium_artisans_crate': '中工匠匣',
    '/items/large_artisans_crate': '大工匠匣',
    '/items/small_treasure_chest': '小宝箱',
    '/items/medium_treasure_chest': '中宝箱',
    '/items/large_treasure_chest': '大宝箱',
    '/items/chimerical_chest': '奇幻宝箱',
    '/items/sinister_chest': '阴森宝箱',
    '/items/enchanted_chest': '秘法宝箱',
    '/items/blue_key_fragment': '蓝色钥匙碎片',
    '/items/green_key_fragment': '绿色钥匙碎片',
    '/items/purple_key_fragment': '紫色钥匙碎片',
    '/items/white_key_fragment': '白色钥匙碎片',
    '/items/orange_key_fragment': '橙色钥匙碎片',
    '/items/brown_key_fragment': '棕色钥匙碎片',
    '/items/stone_key_fragment': '石头钥匙碎片',
    '/items/dark_key_fragment': '黑暗钥匙碎片',
    '/items/burning_key_fragment': '燃烧钥匙碎片',
    '/items/chimerical_entry_key': '奇幻钥匙',
    '/items/chimerical_chest_key': '奇幻宝箱钥匙',
    '/items/sinister_entry_key': '阴森钥匙',
    '/items/sinister_chest_key': '阴森宝箱钥匙',
    '/items/enchanted_entry_key': '秘法钥匙',
    '/items/enchanted_chest_key': '秘法宝箱钥匙',
    '/items/donut': '甜甜圈',
    '/items/blueberry_donut': '蓝莓甜甜圈',
    '/items/blackberry_donut': '黑莓甜甜圈',
    '/items/strawberry_donut': '草莓甜甜圈',
    '/items/mooberry_donut': '哞莓甜甜圈',
    '/items/marsberry_donut': '火星莓甜甜圈',
    '/items/spaceberry_donut': '太空莓甜甜圈',
    '/items/cupcake': '纸杯蛋糕',
    '/items/blueberry_cake': '蓝莓蛋糕',
    '/items/blackberry_cake': '黑莓蛋糕',
    '/items/strawberry_cake': '草莓蛋糕',
    '/items/mooberry_cake': '哞莓蛋糕',
    '/items/marsberry_cake': '火星莓蛋糕',
    '/items/spaceberry_cake': '太空莓蛋糕',
    '/items/gummy': '软糖',
    '/items/apple_gummy': '苹果软糖',
    '/items/orange_gummy': '橙子软糖',
    '/items/plum_gummy': '李子软糖',
    '/items/peach_gummy': '桃子软糖',
    '/items/dragon_fruit_gummy': '火龙果软糖',
    '/items/star_fruit_gummy': '杨桃软糖',
    '/items/yogurt': '酸奶',
    '/items/apple_yogurt': '苹果酸奶',
    '/items/orange_yogurt': '橙子酸奶',
    '/items/plum_yogurt': '李子酸奶',
    '/items/peach_yogurt': '桃子酸奶',
    '/items/dragon_fruit_yogurt': '火龙果酸奶',
    '/items/star_fruit_yogurt': '杨桃酸奶',
    '/items/milking_tea': '挤奶茶',
    '/items/foraging_tea': '采摘茶',
    '/items/woodcutting_tea': '伐木茶',
    '/items/cooking_tea': '烹饪茶',
    '/items/brewing_tea': '冲泡茶',
    '/items/alchemy_tea': '炼金茶',
    '/items/enhancing_tea': '强化茶',
    '/items/cheesesmithing_tea': '奶酪锻造茶',
    '/items/crafting_tea': '制作茶',
    '/items/tailoring_tea': '缝纫茶',
    '/items/super_milking_tea': '超级挤奶茶',
    '/items/super_foraging_tea': '超级采摘茶',
    '/items/super_woodcutting_tea': '超级伐木茶',
    '/items/super_cooking_tea': '超级烹饪茶',
    '/items/super_brewing_tea': '超级冲泡茶',
    '/items/super_alchemy_tea': '超级炼金茶',
    '/items/super_enhancing_tea': '超级强化茶',
    '/items/super_cheesesmithing_tea': '超级奶酪锻造茶',
    '/items/super_crafting_tea': '超级制作茶',
    '/items/super_tailoring_tea': '超级缝纫茶',
    '/items/ultra_milking_tea': '究极挤奶茶',
    '/items/ultra_foraging_tea': '究极采摘茶',
    '/items/ultra_woodcutting_tea': '究极伐木茶',
    '/items/ultra_cooking_tea': '究极烹饪茶',
    '/items/ultra_brewing_tea': '究极冲泡茶',
    '/items/ultra_alchemy_tea': '究极炼金茶',
    '/items/ultra_enhancing_tea': '究极强化茶',
    '/items/ultra_cheesesmithing_tea': '究极奶酪锻造茶',
    '/items/ultra_crafting_tea': '究极制作茶',
    '/items/ultra_tailoring_tea': '究极缝纫茶',
    '/items/gathering_tea': '采集茶',
    '/items/gourmet_tea': '美食茶',
    '/items/wisdom_tea': '经验茶',
    '/items/processing_tea': '加工茶',
    '/items/efficiency_tea': '效率茶',
    '/items/artisan_tea': '工匠茶',
    '/items/catalytic_tea': '催化茶',
    '/items/blessed_tea': '福气茶',
    '/items/stamina_coffee': '耐力咖啡',
    '/items/intelligence_coffee': '智力咖啡',
    '/items/defense_coffee': '防御咖啡',
    '/items/attack_coffee': '攻击咖啡',
    '/items/power_coffee': '力量咖啡',
    '/items/ranged_coffee': '远程咖啡',
    '/items/magic_coffee': '魔法咖啡',
    '/items/super_stamina_coffee': '超级耐力咖啡',
    '/items/super_intelligence_coffee': '超级智力咖啡',
    '/items/super_defense_coffee': '超级防御咖啡',
    '/items/super_attack_coffee': '超级攻击咖啡',
    '/items/super_power_coffee': '超级力量咖啡',
    '/items/super_ranged_coffee': '超级远程咖啡',
    '/items/super_magic_coffee': '超级魔法咖啡',
    '/items/ultra_stamina_coffee': '究极耐力咖啡',
    '/items/ultra_intelligence_coffee': '究极智力咖啡',
    '/items/ultra_defense_coffee': '究极防御咖啡',
    '/items/ultra_attack_coffee': '究极攻击咖啡',
    '/items/ultra_power_coffee': '究极力量咖啡',
    '/items/ultra_ranged_coffee': '究极远程咖啡',
    '/items/ultra_magic_coffee': '究极魔法咖啡',
    '/items/wisdom_coffee': '经验咖啡',
    '/items/lucky_coffee': '幸运咖啡',
    '/items/swiftness_coffee': '迅捷咖啡',
    '/items/channeling_coffee': '吟唱咖啡',
    '/items/critical_coffee': '暴击咖啡',
    '/items/poke': '破胆之刺',
    '/items/impale': '透骨之刺',
    '/items/puncture': '破甲之刺',
    '/items/penetrating_strike': '贯心之刺',
    '/items/scratch': '爪影斩',
    '/items/cleave': '分裂斩',
    '/items/maim': '血刃斩',
    '/items/crippling_slash': '致残斩',
    '/items/smack': '重碾',
    '/items/sweep': '重扫',
    '/items/stunning_blow': '重锤',
    '/items/quick_shot': '快速射击',
    '/items/aqua_arrow': '流水箭',
    '/items/flame_arrow': '烈焰箭',
    '/items/rain_of_arrows': '箭雨',
    '/items/silencing_shot': '沉默之箭',
    '/items/steady_shot': '稳定射击',
    '/items/pestilent_shot': '疫病射击',
    '/items/penetrating_shot': '贯穿射击',
    '/items/water_strike': '流水冲击',
    '/items/ice_spear': '冰枪术',
    '/items/frost_surge': '冰霜爆裂',
    '/items/mana_spring': '法力喷泉',
    '/items/entangle': '缠绕',
    '/items/toxic_pollen': '剧毒粉尘',
    '/items/natures_veil': '自然菌幕',
    '/items/fireball': '火球',
    '/items/flame_blast': '熔岩爆裂',
    '/items/firestorm': '火焰风暴',
    '/items/smoke_burst': '烟爆灭影',
    '/items/minor_heal': '初级自愈术',
    '/items/heal': '自愈术',
    '/items/quick_aid': '快速治疗术',
    '/items/rejuvenate': '群体治疗术',
    '/items/taunt': '嘲讽',
    '/items/provoke': '挑衅',
    '/items/toughness': '坚韧',
    '/items/elusiveness': '闪避',
    '/items/precision': '精确',
    '/items/berserk': '狂暴',
    '/items/elemental_affinity': '元素增幅',
    '/items/frenzy': '狂速',
    '/items/spike_shell': '尖刺防护',
    '/items/arcane_reflection': '奥术反射',
    '/items/vampirism': '吸血',
    '/items/revive': '复活',
    '/items/insanity': '疯狂',
    '/items/invincible': '无敌',
    '/items/fierce_aura': '物理光环',
    '/items/aqua_aura': '流水光环',
    '/items/sylvan_aura': '自然光环',
    '/items/flame_aura': '火焰光环',
    '/items/speed_aura': '速度光环',
    '/items/critical_aura': '暴击光环',
    '/items/gobo_stabber': '哥布林长剑',
    '/items/gobo_slasher': '哥布林关刀',
    '/items/gobo_smasher': '哥布林狼牙棒',
    '/items/spiked_bulwark': '尖刺盾',
    '/items/werewolf_slasher': '狼人关刀',
    '/items/griffin_bulwark': '狮鹫重盾',
    '/items/gobo_shooter': '哥布林弹弓',
    '/items/vampiric_bow': '吸血弓',
    '/items/cursed_bow': '咒怨之弓',
    '/items/gobo_boomstick': '哥布林火棍',
    '/items/cheese_bulwark': '奶酪重盾',
    '/items/verdant_bulwark': '翠绿重盾',
    '/items/azure_bulwark': '蔚蓝重盾',
    '/items/burble_bulwark': '深紫重盾',
    '/items/crimson_bulwark': '绛红重盾',
    '/items/rainbow_bulwark': '彩虹重盾',
    '/items/holy_bulwark': '神圣重盾',
    '/items/wooden_bow': '木弓',
    '/items/birch_bow': '桦木弓',
    '/items/cedar_bow': '雪松弓',
    '/items/purpleheart_bow': '紫心弓',
    '/items/ginkgo_bow': '银杏弓',
    '/items/redwood_bow': '红杉弓',
    '/items/arcane_bow': '神秘弓',
    '/items/stalactite_spear': '石钟长枪',
    '/items/granite_bludgeon': '花岗岩大棒',
    '/items/regal_sword': '君王之剑',
    '/items/chaotic_flail': '混沌连枷',
    '/items/soul_hunter_crossbow': '灵魂猎手弩',
    '/items/sundering_crossbow': '裂空之弩',
    '/items/frost_staff': '冰霜法杖',
    '/items/infernal_battlestaff': '炼狱法杖',
    '/items/jackalope_staff': '鹿角兔之杖',
    '/items/cheese_sword': '奶酪剑',
    '/items/verdant_sword': '翠绿剑',
    '/items/azure_sword': '蔚蓝剑',
    '/items/burble_sword': '深紫剑',
    '/items/crimson_sword': '绛红剑',
    '/items/rainbow_sword': '彩虹剑',
    '/items/holy_sword': '神圣剑',
    '/items/cheese_spear': '奶酪长枪',
    '/items/verdant_spear': '翠绿长枪',
    '/items/azure_spear': '蔚蓝长枪',
    '/items/burble_spear': '深紫长枪',
    '/items/crimson_spear': '绛红长枪',
    '/items/rainbow_spear': '彩虹长枪',
    '/items/holy_spear': '神圣长枪',
    '/items/cheese_mace': '奶酪钉头锤',
    '/items/verdant_mace': '翠绿钉头锤',
    '/items/azure_mace': '蔚蓝钉头锤',
    '/items/burble_mace': '深紫钉头锤',
    '/items/crimson_mace': '绛红钉头锤',
    '/items/rainbow_mace': '彩虹钉头锤',
    '/items/holy_mace': '神圣钉头锤',
    '/items/wooden_crossbow': '木弩',
    '/items/birch_crossbow': '桦木弩',
    '/items/cedar_crossbow': '雪松弩',
    '/items/purpleheart_crossbow': '紫心弩',
    '/items/ginkgo_crossbow': '银杏弩',
    '/items/redwood_crossbow': '红杉弩',
    '/items/arcane_crossbow': '神秘弩',
    '/items/wooden_water_staff': '木制水法杖',
    '/items/birch_water_staff': '桦木水法杖',
    '/items/cedar_water_staff': '雪松水法杖',
    '/items/purpleheart_water_staff': '紫心水法杖',
    '/items/ginkgo_water_staff': '银杏水法杖',
    '/items/redwood_water_staff': '红杉水法杖',
    '/items/arcane_water_staff': '神秘水法杖',
    '/items/wooden_nature_staff': '木制自然法杖',
    '/items/birch_nature_staff': '桦木自然法杖',
    '/items/cedar_nature_staff': '雪松自然法杖',
    '/items/purpleheart_nature_staff': '紫心自然法杖',
    '/items/ginkgo_nature_staff': '银杏自然法杖',
    '/items/redwood_nature_staff': '红杉自然法杖',
    '/items/arcane_nature_staff': '神秘自然法杖',
    '/items/wooden_fire_staff': '木火法杖',
    '/items/birch_fire_staff': '桦木火法杖',
    '/items/cedar_fire_staff': '雪松火法杖',
    '/items/purpleheart_fire_staff': '紫心火法杖',
    '/items/ginkgo_fire_staff': '银杏火法杖',
    '/items/redwood_fire_staff': '红杉火法杖',
    '/items/arcane_fire_staff': '神秘火法杖',
    '/items/eye_watch': '掌上监工',
    '/items/snake_fang_dirk': '蛇牙短剑',
    '/items/vision_shield': '视觉盾',
    '/items/gobo_defender': '哥布林防御者',
    '/items/vampire_fang_dirk': '吸血鬼短剑',
    '/items/knights_aegis': '骑士盾',
    '/items/treant_shield': '树人盾',
    '/items/manticore_shield': '蝎狮盾',
    '/items/tome_of_healing': '治疗之书',
    '/items/tome_of_the_elements': '元素之书',
    '/items/watchful_relic': '警戒遗物',
    '/items/bishops_codex': '主教法典',
    '/items/cheese_buckler': '奶酪圆盾',
    '/items/verdant_buckler': '翠绿圆盾',
    '/items/azure_buckler': '蔚蓝圆盾',
    '/items/burble_buckler': '深紫圆盾',
    '/items/crimson_buckler': '绛红圆盾',
    '/items/rainbow_buckler': '彩虹圆盾',
    '/items/holy_buckler': '神圣圆盾',
    '/items/wooden_shield': '木盾',
    '/items/birch_shield': '桦木盾',
    '/items/cedar_shield': '雪松盾',
    '/items/purpleheart_shield': '紫心盾',
    '/items/ginkgo_shield': '银杏盾',
    '/items/redwood_shield': '红杉盾',
    '/items/arcane_shield': '神秘盾',
    '/items/sinister_cape': '阴森斗篷',
    '/items/chimerical_quiver': '奇幻箭袋',
    '/items/enchanted_cloak': '秘法披风',
    '/items/red_culinary_hat': '红色厨师帽',
    '/items/snail_shell_helmet': '蜗牛壳头盔',
    '/items/vision_helmet': '视觉头盔',
    '/items/fluffy_red_hat': '蓬松红帽子',
    '/items/acrobatic_hood': '杂技师兜帽',
    '/items/magicians_hat': '魔术师帽',
    '/items/cheese_helmet': '奶酪头盔',
    '/items/verdant_helmet': '翠绿头盔',
    '/items/azure_helmet': '蔚蓝头盔',
    '/items/burble_helmet': '深紫头盔',
    '/items/crimson_helmet': '绛红头盔',
    '/items/rainbow_helmet': '彩虹头盔',
    '/items/holy_helmet': '神圣头盔',
    '/items/rough_hood': '粗糙兜帽',
    '/items/reptile_hood': '爬行动物兜帽',
    '/items/gobo_hood': '哥布林兜帽',
    '/items/beast_hood': '野兽兜帽',
    '/items/umbral_hood': '暗影兜帽',
    '/items/cotton_hat': '棉帽',
    '/items/linen_hat': '亚麻帽',
    '/items/bamboo_hat': '竹帽',
    '/items/silk_hat': '丝帽',
    '/items/radiant_hat': '光辉帽',
    '/items/dairyhands_top': '挤奶工上衣',
    '/items/foragers_top': '采摘者上衣',
    '/items/lumberjacks_top': '伐木工上衣',
    '/items/cheesemakers_top': '奶酪师上衣',
    '/items/crafters_top': '工匠上衣',
    '/items/tailors_top': '裁缝上衣',
    '/items/chefs_top': '厨师上衣',
    '/items/brewers_top': '饮品师上衣',
    '/items/alchemists_top': '炼金师上衣',
    '/items/enhancers_top': '强化师上衣',
    '/items/gator_vest': '鳄鱼马甲',
    '/items/turtle_shell_body': '龟壳胸甲',
    '/items/colossus_plate_body': '巨像胸甲',
    '/items/demonic_plate_body': '恶魔胸甲',
    '/items/marine_tunic': '海洋皮衣',
    '/items/revenant_tunic': '亡灵皮衣',
    '/items/griffin_tunic': '狮鹫皮衣',
    '/items/icy_robe_top': '冰霜袍服',
    '/items/flaming_robe_top': '烈焰袍服',
    '/items/luna_robe_top': '月神袍服',
    '/items/royal_water_robe_top': '皇家水系袍服',
    '/items/royal_nature_robe_top': '皇家自然系袍服',
    '/items/royal_fire_robe_top': '皇家火系袍服',
    '/items/cheese_plate_body': '奶酪胸甲',
    '/items/verdant_plate_body': '翠绿胸甲',
    '/items/azure_plate_body': '蔚蓝胸甲',
    '/items/burble_plate_body': '深紫胸甲',
    '/items/crimson_plate_body': '绛红胸甲',
    '/items/rainbow_plate_body': '彩虹胸甲',
    '/items/holy_plate_body': '神圣胸甲',
    '/items/rough_tunic': '粗糙皮衣',
    '/items/reptile_tunic': '爬行动物皮衣',
    '/items/gobo_tunic': '哥布林皮衣',
    '/items/beast_tunic': '野兽皮衣',
    '/items/umbral_tunic': '暗影皮衣',
    '/items/cotton_robe_top': '棉布袍服',
    '/items/linen_robe_top': '亚麻袍服',
    '/items/bamboo_robe_top': '竹袍服',
    '/items/silk_robe_top': '丝绸袍服',
    '/items/radiant_robe_top': '光辉袍服',
    '/items/dairyhands_bottoms': '挤奶工下装',
    '/items/foragers_bottoms': '采摘者下装',
    '/items/lumberjacks_bottoms': '伐木工下装',
    '/items/cheesemakers_bottoms': '奶酪师下装',
    '/items/crafters_bottoms': '工匠下装',
    '/items/tailors_bottoms': '裁缝下装',
    '/items/chefs_bottoms': '厨师下装',
    '/items/brewers_bottoms': '饮品师下装',
    '/items/alchemists_bottoms': '炼金师下装',
    '/items/enhancers_bottoms': '强化师下装',
    '/items/turtle_shell_legs': '龟壳腿甲',
    '/items/colossus_plate_legs': '巨像腿甲',
    '/items/demonic_plate_legs': '恶魔腿甲',
    '/items/marine_chaps': '航海皮裤',
    '/items/revenant_chaps': '亡灵皮裤',
    '/items/griffin_chaps': '狮鹫皮裤',
    '/items/icy_robe_bottoms': '冰霜袍裙',
    '/items/flaming_robe_bottoms': '烈焰袍裙',
    '/items/luna_robe_bottoms': '月神袍裙',
    '/items/royal_water_robe_bottoms': '皇家水系袍裙',
    '/items/royal_nature_robe_bottoms': '皇家自然系袍裙',
    '/items/royal_fire_robe_bottoms': '皇家火系袍裙',
    '/items/cheese_plate_legs': '奶酪腿甲',
    '/items/verdant_plate_legs': '翠绿腿甲',
    '/items/azure_plate_legs': '蔚蓝腿甲',
    '/items/burble_plate_legs': '深紫腿甲',
    '/items/crimson_plate_legs': '绛红腿甲',
    '/items/rainbow_plate_legs': '彩虹腿甲',
    '/items/holy_plate_legs': '神圣腿甲',
    '/items/rough_chaps': '粗糙皮裤',
    '/items/reptile_chaps': '爬行动物皮裤',
    '/items/gobo_chaps': '哥布林皮裤',
    '/items/beast_chaps': '野兽皮裤',
    '/items/umbral_chaps': '暗影皮裤',
    '/items/cotton_robe_bottoms': '棉袍裙',
    '/items/linen_robe_bottoms': '亚麻袍裙',
    '/items/bamboo_robe_bottoms': '竹袍裙',
    '/items/silk_robe_bottoms': '丝绸袍裙',
    '/items/radiant_robe_bottoms': '光辉袍裙',
    '/items/enchanted_gloves': '附魔手套',
    '/items/pincer_gloves': '蟹钳手套',
    '/items/panda_gloves': '熊猫手套',
    '/items/magnetic_gloves': '磁力手套',
    '/items/dodocamel_gauntlets': '渡渡驼护手',
    '/items/sighted_bracers': '瞄准护腕',
    '/items/chrono_gloves': '时空手套',
    '/items/cheese_gauntlets': '奶酪护手',
    '/items/verdant_gauntlets': '翠绿护手',
    '/items/azure_gauntlets': '蔚蓝护手',
    '/items/burble_gauntlets': '深紫护手',
    '/items/crimson_gauntlets': '绛红护手',
    '/items/rainbow_gauntlets': '彩虹护手',
    '/items/holy_gauntlets': '神圣护手',
    '/items/rough_bracers': '粗糙护腕',
    '/items/reptile_bracers': '爬行动物护腕',
    '/items/gobo_bracers': '哥布林护腕',
    '/items/beast_bracers': '野兽护腕',
    '/items/umbral_bracers': '暗影护腕',
    '/items/cotton_gloves': '棉手套',
    '/items/linen_gloves': '亚麻手套',
    '/items/bamboo_gloves': '竹手套',
    '/items/silk_gloves': '丝手套',
    '/items/radiant_gloves': '光辉手套',
    '/items/collectors_boots': '收藏家靴',
    '/items/shoebill_shoes': '鲸头鹳鞋',
    '/items/black_bear_shoes': '黑熊鞋',
    '/items/grizzly_bear_shoes': '棕熊鞋',
    '/items/polar_bear_shoes': '北极熊鞋',
    '/items/centaur_boots': '半人马靴',
    '/items/sorcerer_boots': '巫师靴',
    '/items/cheese_boots': '奶酪靴',
    '/items/verdant_boots': '翠绿靴',
    '/items/azure_boots': '蔚蓝靴',
    '/items/burble_boots': '深紫靴',
    '/items/crimson_boots': '绛红靴',
    '/items/rainbow_boots': '彩虹靴',
    '/items/holy_boots': '神圣靴',
    '/items/rough_boots': '粗糙靴',
    '/items/reptile_boots': '爬行动物靴',
    '/items/gobo_boots': '哥布林靴',
    '/items/beast_boots': '野兽靴',
    '/items/umbral_boots': '暗影靴',
    '/items/cotton_boots': '棉靴',
    '/items/linen_boots': '亚麻靴',
    '/items/bamboo_boots': '竹靴',
    '/items/silk_boots': '丝靴',
    '/items/radiant_boots': '光辉靴',
    '/items/small_pouch': '小袋子',
    '/items/medium_pouch': '中袋子',
    '/items/large_pouch': '大袋子',
    '/items/giant_pouch': '巨大袋子',
    '/items/gluttonous_pouch': '贪食之袋',
    '/items/guzzling_pouch': '暴饮之囊',
    '/items/necklace_of_efficiency': '效率项链',
    '/items/fighter_necklace': '战士项链',
    '/items/ranger_necklace': '射手项链',
    '/items/wizard_necklace': '巫师项链',
    '/items/necklace_of_wisdom': '经验项链',
    '/items/necklace_of_speed': '速度项链',
    '/items/philosophers_necklace': '贤者项链',
    '/items/earrings_of_gathering': '采集耳环',
    '/items/earrings_of_essence_find': '精华发现耳环',
    '/items/earrings_of_armor': '护甲耳环',
    '/items/earrings_of_regeneration': '恢复耳环',
    '/items/earrings_of_resistance': '抗性耳环',
    '/items/earrings_of_rare_find': '稀有发现耳环',
    '/items/earrings_of_critical_strike': '暴击耳环',
    '/items/philosophers_earrings': '贤者耳环',
    '/items/ring_of_gathering': '采集戒指',
    '/items/ring_of_essence_find': '精华发现戒指',
    '/items/ring_of_armor': '护甲戒指',
    '/items/ring_of_regeneration': '恢复戒指',
    '/items/ring_of_resistance': '抗性戒指',
    '/items/ring_of_rare_find': '稀有发现戒指',
    '/items/ring_of_critical_strike': '暴击戒指',
    '/items/philosophers_ring': '贤者戒指',
    '/items/basic_task_badge': '基础任务徽章',
    '/items/advanced_task_badge': '高级任务徽章',
    '/items/expert_task_badge': '专家任务徽章',
    '/items/celestial_brush': '星空刷子',
    '/items/cheese_brush': '奶酪刷子',
    '/items/verdant_brush': '翠绿刷子',
    '/items/azure_brush': '蔚蓝刷子',
    '/items/burble_brush': '深紫刷子',
    '/items/crimson_brush': '绛红刷子',
    '/items/rainbow_brush': '彩虹刷子',
    '/items/holy_brush': '神圣刷子',
    '/items/celestial_shears': '星空剪刀',
    '/items/cheese_shears': '奶酪剪刀',
    '/items/verdant_shears': '翠绿剪刀',
    '/items/azure_shears': '蔚蓝剪刀',
    '/items/burble_shears': '深紫剪刀',
    '/items/crimson_shears': '绛红剪刀',
    '/items/rainbow_shears': '彩虹剪刀',
    '/items/holy_shears': '神圣剪刀',
    '/items/celestial_hatchet': '星空斧头',
    '/items/cheese_hatchet': '奶酪斧头',
    '/items/verdant_hatchet': '翠绿斧头',
    '/items/azure_hatchet': '蔚蓝斧头',
    '/items/burble_hatchet': '深紫斧头',
    '/items/crimson_hatchet': '绛红斧头',
    '/items/rainbow_hatchet': '彩虹斧头',
    '/items/holy_hatchet': '神圣斧头',
    '/items/celestial_hammer': '星空锤子',
    '/items/cheese_hammer': '奶酪锤子',
    '/items/verdant_hammer': '翠绿锤子',
    '/items/azure_hammer': '蔚蓝锤子',
    '/items/burble_hammer': '深紫锤子',
    '/items/crimson_hammer': '绛红锤子',
    '/items/rainbow_hammer': '彩虹锤子',
    '/items/holy_hammer': '神圣锤子',
    '/items/celestial_chisel': '星空凿子',
    '/items/cheese_chisel': '奶酪凿子',
    '/items/verdant_chisel': '翠绿凿子',
    '/items/azure_chisel': '蔚蓝凿子',
    '/items/burble_chisel': '深紫凿子',
    '/items/crimson_chisel': '绛红凿子',
    '/items/rainbow_chisel': '彩虹凿子',
    '/items/holy_chisel': '神圣凿子',
    '/items/celestial_needle': '星空针',
    '/items/cheese_needle': '奶酪针',
    '/items/verdant_needle': '翠绿针',
    '/items/azure_needle': '蔚蓝针',
    '/items/burble_needle': '深紫针',
    '/items/crimson_needle': '绛红针',
    '/items/rainbow_needle': '彩虹针',
    '/items/holy_needle': '神圣针',
    '/items/celestial_spatula': '星空锅铲',
    '/items/cheese_spatula': '奶酪锅铲',
    '/items/verdant_spatula': '翠绿锅铲',
    '/items/azure_spatula': '蔚蓝锅铲',
    '/items/burble_spatula': '深紫锅铲',
    '/items/crimson_spatula': '绛红锅铲',
    '/items/rainbow_spatula': '彩虹锅铲',
    '/items/holy_spatula': '神圣锅铲',
    '/items/celestial_pot': '星空壶',
    '/items/cheese_pot': '奶酪壶',
    '/items/verdant_pot': '翠绿壶',
    '/items/azure_pot': '蔚蓝壶',
    '/items/burble_pot': '深紫壶',
    '/items/crimson_pot': '绛红壶',
    '/items/rainbow_pot': '彩虹壶',
    '/items/holy_pot': '神圣壶',
    '/items/celestial_alembic': '星空蒸馏器',
    '/items/cheese_alembic': '奶酪蒸馏器',
    '/items/verdant_alembic': '翠绿蒸馏器',
    '/items/azure_alembic': '蔚蓝蒸馏器',
    '/items/burble_alembic': '深紫蒸馏器',
    '/items/crimson_alembic': '绛红蒸馏器',
    '/items/rainbow_alembic': '彩虹蒸馏器',
    '/items/holy_alembic': '神圣蒸馏器',
    '/items/celestial_enhancer': '星空强化器',
    '/items/cheese_enhancer': '奶酪强化器',
    '/items/verdant_enhancer': '翠绿强化器',
    '/items/azure_enhancer': '蔚蓝强化器',
    '/items/burble_enhancer': '深紫强化器',
    '/items/crimson_enhancer': '绛红强化器',
    '/items/rainbow_enhancer': '彩虹强化器',
    '/items/holy_enhancer': '神圣强化器',
    '/items/milk': '牛奶',
    '/items/verdant_milk': '翠绿牛奶',
    '/items/azure_milk': '蔚蓝牛奶',
    '/items/burble_milk': '深紫牛奶',
    '/items/crimson_milk': '绛红牛奶',
    '/items/rainbow_milk': '彩虹牛奶',
    '/items/holy_milk': '神圣牛奶',
    '/items/cheese': '奶酪',
    '/items/verdant_cheese': '翠绿奶酪',
    '/items/azure_cheese': '蔚蓝奶酪',
    '/items/burble_cheese': '深紫奶酪',
    '/items/crimson_cheese': '绛红奶酪',
    '/items/rainbow_cheese': '彩虹奶酪',
    '/items/holy_cheese': '神圣奶酪',
    '/items/log': '原木',
    '/items/birch_log': '白桦原木',
    '/items/cedar_log': '雪松原木',
    '/items/purpleheart_log': '紫心原木',
    '/items/ginkgo_log': '银杏原木',
    '/items/redwood_log': '红杉原木',
    '/items/arcane_log': '神秘原木',
    '/items/lumber': '木板',
    '/items/birch_lumber': '白桦木板',
    '/items/cedar_lumber': '雪松木板',
    '/items/purpleheart_lumber': '紫心木板',
    '/items/ginkgo_lumber': '银杏木板',
    '/items/redwood_lumber': '红杉木板',
    '/items/arcane_lumber': '神秘木板',
    '/items/rough_hide': '粗糙兽皮',
    '/items/reptile_hide': '爬行动物皮',
    '/items/gobo_hide': '哥布林皮',
    '/items/beast_hide': '野兽皮',
    '/items/umbral_hide': '暗影皮',
    '/items/rough_leather': '粗糙皮革',
    '/items/reptile_leather': '爬行动物皮革',
    '/items/gobo_leather': '哥布林皮革',
    '/items/beast_leather': '野兽皮革',
    '/items/umbral_leather': '暗影皮革',
    '/items/cotton': '棉花',
    '/items/flax': '亚麻',
    '/items/bamboo_branch': '竹子',
    '/items/cocoon': '蚕茧',
    '/items/radiant_fiber': '光辉纤维',
    '/items/cotton_fabric': '棉花布料',
    '/items/linen_fabric': '亚麻布料',
    '/items/bamboo_fabric': '竹子布料',
    '/items/silk_fabric': '丝绸',
    '/items/radiant_fabric': '光辉布料',
    '/items/egg': '鸡蛋',
    '/items/wheat': '小麦',
    '/items/sugar': '糖',
    '/items/blueberry': '蓝莓',
    '/items/blackberry': '黑莓',
    '/items/strawberry': '草莓',
    '/items/mooberry': '哞梅',
    '/items/marsberry': '火星梅',
    '/items/spaceberry': '太空梅',
    '/items/apple': '苹果',
    '/items/orange': '橙子',
    '/items/plum': '李子',
    '/items/peach': '桃子',
    '/items/dragon_fruit': '火龙果',
    '/items/star_fruit': '杨桃',
    '/items/arabica_coffee_bean': '低级咖啡豆',
    '/items/robusta_coffee_bean': '中级咖啡豆',
    '/items/liberica_coffee_bean': '高级咖啡豆',
    '/items/excelsa_coffee_bean': '特级咖啡豆',
    '/items/fieriosa_coffee_bean': '火山咖啡豆',
    '/items/spacia_coffee_bean': '太空咖啡豆',
    '/items/green_tea_leaf': '绿茶叶',
    '/items/black_tea_leaf': '黑茶叶',
    '/items/burble_tea_leaf': '紫茶叶',
    '/items/moolong_tea_leaf': '哞龙茶叶',
    '/items/red_tea_leaf': '红茶叶',
    '/items/emp_tea_leaf': '虚空茶叶',
    '/items/catalyst_of_coinification': '点金催化剂',
    '/items/catalyst_of_decomposition': '分解催化剂',
    '/items/catalyst_of_transmutation': '转化催化剂',
    '/items/prime_catalyst': '至高催化剂',
    '/items/snake_fang': '蛇牙',
    '/items/shoebill_feather': '鲸头鹳羽毛',
    '/items/snail_shell': '蜗牛壳',
    '/items/crab_pincer': '蟹钳',
    '/items/turtle_shell': '乌龟壳',
    '/items/marine_scale': '海洋鳞片',
    '/items/treant_bark': '树皮',
    '/items/centaur_hoof': '半人马蹄',
    '/items/luna_wing': '月神翼',
    '/items/gobo_rag': '哥布林抹布',
    '/items/goggles': '护目镜',
    '/items/magnifying_glass': '放大镜',
    '/items/eye_of_the_watcher': '观察者之眼',
    '/items/icy_cloth': '冰霜织物',
    '/items/flaming_cloth': '烈焰织物',
    '/items/sorcerers_sole': '魔法师鞋底',
    '/items/chrono_sphere': '时空球',
    '/items/frost_sphere': '冰霜球',
    '/items/panda_fluff': '熊猫绒',
    '/items/black_bear_fluff': '黑熊绒',
    '/items/grizzly_bear_fluff': '棕熊绒',
    '/items/polar_bear_fluff': '北极熊绒',
    '/items/red_panda_fluff': '小熊猫绒',
    '/items/magnet': '磁铁',
    '/items/stalactite_shard': '钟乳石碎片',
    '/items/living_granite': '花岗岩',
    '/items/colossus_core': '巨像核心',
    '/items/vampire_fang': '吸血鬼之牙',
    '/items/werewolf_claw': '狼人之爪',
    '/items/revenant_anima': '亡者之魂',
    '/items/soul_fragment': '灵魂碎片',
    '/items/infernal_ember': '地狱余烬',
    '/items/demonic_core': '恶魔核心',
    '/items/griffin_leather': '狮鹫之皮',
    '/items/manticore_sting': '蝎狮之刺',
    '/items/jackalope_antler': '鹿角兔之角',
    '/items/dodocamel_plume': '渡渡驼之翎',
    '/items/griffin_talon': '狮鹫之爪',
    '/items/acrobats_ribbon': '杂技师彩带',
    '/items/magicians_cloth': '魔术师织物',
    '/items/chaotic_chain': '混沌锁链',
    '/items/cursed_ball': '诅咒之球',
    '/items/royal_cloth': '皇家织物',
    '/items/knights_ingot': '骑士之锭',
    '/items/bishops_scroll': '主教卷轴',
    '/items/regal_jewel': '君王宝石',
    '/items/sundering_jewel': '裂空宝石',
    '/items/butter_of_proficiency': '精通之油',
    '/items/thread_of_expertise': '专精之线',
    '/items/branch_of_insight': '洞察之枝',
    '/items/gluttonous_energy': '贪食能量',
    '/items/guzzling_energy': '暴饮能量',
    '/items/milking_essence': '挤奶精华',
    '/items/foraging_essence': '采摘精华',
    '/items/woodcutting_essence': '伐木精华',
    '/items/cheesesmithing_essence': '奶酪锻造精华',
    '/items/crafting_essence': '制作精华',
    '/items/tailoring_essence': '缝纫精华',
    '/items/cooking_essence': '烹饪精华',
    '/items/brewing_essence': '冲泡精华',
    '/items/alchemy_essence': '炼金精华',
    '/items/enhancing_essence': '强化精华',
    '/items/swamp_essence': '沼泽精华',
    '/items/aqua_essence': '海洋精华',
    '/items/jungle_essence': '丛林精华',
    '/items/gobo_essence': '哥布林精华',
    '/items/eyessence': '眼精华',
    '/items/sorcerer_essence': '法师精华',
    '/items/bear_essence': '熊熊精华',
    '/items/golem_essence': '魔像精华',
    '/items/twilight_essence': '暮光精华',
    '/items/abyssal_essence': '地狱精华',
    '/items/chimerical_essence': '奇幻精华',
    '/items/sinister_essence': '阴森精华',
    '/items/enchanted_essence': '秘法精华',
    '/items/task_crystal': '任务水晶',
    '/items/star_fragment': '星光碎片',
    '/items/pearl': '珍珠',
    '/items/amber': '琥珀',
    '/items/garnet': '石榴石',
    '/items/jade': '翡翠',
    '/items/amethyst': '紫水晶',
    '/items/moonstone': '月亮石',
    '/items/sunstone': '太阳石',
    '/items/philosophers_stone': '贤者之石',
    '/items/crushed_pearl': '珍珠碎片',
    '/items/crushed_amber': '琥珀碎片',
    '/items/crushed_garnet': '石榴石碎片',
    '/items/crushed_jade': '翡翠碎片',
    '/items/crushed_amethyst': '紫水晶碎片',
    '/items/crushed_moonstone': '月亮石碎片',
    '/items/crushed_sunstone': '太阳石碎片',
    '/items/crushed_philosophers_stone': '贤者之石碎片',
    '/items/shard_of_protection': '保护碎片',
    '/items/mirror_of_protection': '保护之镜'
  };
  let trade_history = {};
  if (localStorage.getItem("mooket_trade_history")) {
    trade_history = JSON.parse(localStorage.getItem("mooket_trade_history"));
  }


  let initData_itemDetailMap = null;
  if (localStorage.getItem("initClientData")) {
    const obj = JSON.parse(localStorage.getItem("initClientData"));
    initData_itemDetailMap = obj.itemDetailMap;
  }
  function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;
    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
      const socket = this.currentTarget;
      if (!(socket instanceof WebSocket)) {
        return oriGet.call(this);
      }
      if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
        return oriGet.call(this);
      }
      const message = oriGet.call(this);
      Object.defineProperty(this, "data", { value: message }); // Anti-loop
      try { handleMessage(message); }
      catch (e) { console.log("handleMessage error:", e); }
      return message;
    }
  }
  function handleMessage(message) {
    let obj = JSON.parse(message);
    if (obj && obj.type === "init_client_data") {
      initData_itemDetailMap = obj.itemDetailMap;
    }
    else if (obj && obj.type === "market_item_order_books_updated") {
      requestItemPrice(obj.marketItemOrderBooks.itemHrid, cur_day);
    } else if (obj && obj.type === "market_listings_updated") {//挂单变动
      obj.endMarketListings.forEach(order => {
        if (order.filledQuantity == 0) return;//没有成交的订单不记录
        let key = order.itemHrid + "_" + order.enhancementLevel;

        let tradeItem = trade_history[key] || {}
        if (order.isSell) {
          tradeItem.sell = order.price;
        } else {
          tradeItem.buy = order.price;
        }
        trade_history[key] = tradeItem;
      });
      localStorage.setItem("mooket_trade_history", JSON.stringify(trade_history));//保存挂单数据

    }
    return message;
  }

  hookWS();

  let cur_day = 1;
  let curHridName = null;
  let curItemNameCN = null;
  let w = "500px";
  let h = "280px";
  let configStr = localStorage.getItem("mooket_config");
  let config = configStr ? JSON.parse(configStr) : { "dayIndex": 0, "visible": true, "filter": { "bid": true, "ask": true, "mean": true } };
  cur_day = config.day;//读取设置

  window.onresize = function () {
    checkSize();
  };
  function checkSize() {
    if (window.innerWidth < window.innerHeight) {
      w = "280px";
      h = "500px";
    } else {
      w = "500px";
      h = "280px";
    }
  }
  checkSize();
  // 创建容器元素并设置样式和位置
  const container = document.createElement('div');
  container.style.border = "1px solid #ccc"; //边框样式
  container.style.backgroundColor = "#fff";
  container.style.position = "fixed";
  container.style.zIndex = 10000;
  container.style.top = "50px"; //距离顶部位置
  container.style.left = "130px"; //距离左侧位置
  container.style.width = w; //容器宽度
  container.style.height = h; //容器高度
  container.style.resize = "both";
  container.style.overflow = "auto";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.flex = "1";
  container.style.minHeight = "33px";
  container.style.minWidth = "70px";
  container.style.cursor = "move";
  container.style.userSelect="none";
  container.addEventListener("mousedown", function (e) {
    const rect = container.getBoundingClientRect();
    if (e.clientX > rect.right - 10 && e.clientY > rect.bottom - 10) {
      return;
    }
    let disX = e.clientX - container.offsetLeft;
    let disY = e.clientY - container.offsetTop;
    document.onmousemove = function (e) {
      let x = e.clientX - disX;
      let y = e.clientY - disY;
      container.style.left = x + 'px';
      container.style.top = y + 'px';
    };
    document.onmouseup = function () {
      document.onmousemove = document.onmouseup = null;
    };
  });
  document.body.appendChild(container);

  const ctx = document.createElement('canvas');
  ctx.id = "myChart";
  container.appendChild(ctx);

  // 创建下拉菜单并设置样式和位置
  let wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '5px';
  wrapper.style.right = '16px';
  wrapper.style.fontSize = '14px';

  //wrapper.style.backgroundColor = '#fff';
  wrapper.style.flexShrink = 0;
  container.appendChild(wrapper);

  const days = [1, 3, 7, 14, 30, 180, 360];
  const dayTitle = ['1天', '3天', '1周', '2周', '1月', '半年', '一年'];
  cur_day = days[config.dayIndex];

  let select = document.createElement('select');
  select.style.cursor = 'pointer';
  select.style.verticalAlign = 'middle';
  select.onchange = function () {
    cur_day = this.value;
    config.dayIndex = days.indexOf(parseInt(this.value));
    if (curHridName) requestItemPrice(curHridName, cur_day);
    save_config();
  };

  for (let i = 0; i < days.length; i++) {
    let option = document.createElement('option');
    option.value = days[i];
    option.text = dayTitle[i];
    if (i === config.dayIndex) option.selected = true;
    select.appendChild(option);
  }

  wrapper.appendChild(select);

  //一个固定的文本显示买入卖出历史价格
  let price_info = document.createElement('div');
  price_info.style.position = 'absolute';
  price_info.style.top = '5px';
  price_info.style.left = '65px';
  price_info.style.fontSize = '14px';
  price_info.title = "我的最近买/卖价格"
  price_info.style.width = "max-content";
  price_info.style.whiteSpace = "nowrap";

  let buy_price = document.createElement('span');
  let sell_price = document.createElement('span');
  price_info.appendChild(buy_price);
  price_info.appendChild(sell_price);
  buy_price.style.color = 'red';
  sell_price.style.color = 'green';

  container.appendChild(price_info);

  //添加一个btn隐藏canvas和wrapper
  let btn_close = document.createElement('input');
  btn_close.type = 'button';
  btn_close.value = '📈隐藏';
  btn_close.style.textAlign = 'center';
  btn_close.style.display = 'inline';
  btn_close.style.margin = 0;
  btn_close.style.top = '2px';
  btn_close.style.left = '2px';
  btn_close.style.cursor = 'pointer';
  btn_close.style.position = 'absolute';
  let lastWidth;
  let lastHeight;
  btn_close.onclick = toggle;

  function toggle() {
    if (wrapper.style.display === 'none') {
      wrapper.style.display = ctx.style.display = 'block';
      container.style.resize = "both";
      btn_close.value = '📈隐藏';
      container.style.width = lastWidth;
      container.style.height = lastHeight;
      config.visible = true;
      save_config();
    } else {
      lastWidth = container.style.width;
      lastHeight = container.style.height;
      wrapper.style.display = ctx.style.display = 'none';
      container.style.resize = "none";
      container.style.width = "auto";
      container.style.height = "auto";
      btn_close.value = '📈显示';
      config.visible = false;
      save_config();
    }
  };

  container.appendChild(btn_close);
  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: '市场',
        data: [],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1
      }]
    },
    options: {
      onClick: save_config,
      responsive: true,
      maintainAspectRatio: false,
      pointRadius: 0,
      pointHitRadius: 20,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            // 自定义刻度标签格式化
            callback: showNumber
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: "",
        }
      }
    }
  });

  function requestItemPrice(itemHridName, day = 1) {
    curHridName = itemHridName;
    cur_day = day;
    let itemNameEN = initData_itemDetailMap[itemHridName].name;
    curItemNameCN = itemNamesCN[itemHridName];


    let time = day * 3600 * 24;
    fetch("https://mooket.qi-e.top/market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: itemNameEN,
        time: time
      })
    }).then(res => {
      res.json().then(data => updateChart(data, cur_day));
    })
  }
  function uploadItemPrice(marketItemOrderBooks, day = 1) {

  }
  function formatTime(timestamp, range) {
    const date = new Date(timestamp * 1000);
    const pad = n => n.toString().padStart(2, '0');

    // 获取各时间组件
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const shortYear = date.getFullYear().toString().slice(-2);

    // 根据时间范围选择格式
    switch (parseInt(range)) {
      case 1: // 1天：只显示时间
        return `${hours}:${minutes}`;

      case 3: // 3天：日+时段
        return `${hours}:${minutes}`;

      case 7: // 7天：月/日 + 时段
        return `${day}.${hours}`;
      case 14: // 14天：月/日 + 时段
        return `${day}.${hours}`;
      case 30: // 30天：月/日
        return `${month}/${day}`;

      default: // 180天：年/月
        return `${shortYear}/${month}`;
    }
  }

  function showNumber(num) {
    if(isNaN(num))return num;
    if (num === 0) return "0";  // 单独处理0的情况

    const absNum = Math.abs(num);

    //num保留一位小数
    if (num < 1) return num.toFixed(2);

    return absNum >= 1e10 ? `${(num / 1e9).toFixed(1)}B` :
        absNum >= 1e7 ? `${(num / 1e6).toFixed(1)}M` :
            absNum >= 1e4 ? `${Math.floor(num / 1e3)}K` :
                `${Math.floor(num)}`;
}
  //data={'bid':[{time:1,price:1}],'ask':[{time:1,price:1}]}
  function updateChart(data, day) {
    //过滤异常元素
    for (let i = data.bid.length - 1; i >= 0; i--) {
      if (data.bid[i].price < 0 || data.ask[i].price < 0) {
        data.bid.splice(i, 1);
        data.ask.splice(i, 1);
      }
    }
    //timestamp转日期时间
    //根据day输出不同的时间表示，<3天显示时分，<=7天显示日时，<=30天显示月日，>30天显示年月

    //显示历史价格
    let enhancementLevel = document.querySelector(".MarketplacePanel_infoContainer__2mCnh .Item_enhancementLevel__19g-e")?.textContent.replace("+", "") || "0";
    let tradeName = curHridName + "_" + parseInt(enhancementLevel);
    if (trade_history[tradeName]) {
      let buy = trade_history[tradeName].buy || "无";
      let sell = trade_history[tradeName].sell || "无";
      price_info.style.display = "block";
      let levelStr = enhancementLevel > 0 ? "(+" + enhancementLevel + ")" : "";
      price_info.innerHTML = `<span style="color:red">${showNumber(buy)}</span>/<span style="color:green">${showNumber(sell)}</span>${levelStr}`;
      container.style.minWidth = price_info.clientWidth + 70 + "px";

    } else {
      price_info.style.display = "none";
      container.style.minWidth = "70px";
    }

    let labels = data.bid.map(x => formatTime(x.time, day));

    chart.data.labels = labels;

    let sma = [];
    let sma_size = 6;
    let sma_window = [];
    for (let i = 0; i < data.bid.length; i++) {
      sma_window.push((data.bid[i].price + data.ask[i].price) / 2);
      if (sma_window.length > sma_size) sma_window.shift();
      sma.push(sma_window.reduce((a, b) => a + b, 0) / sma_window.length);
    }
    chart.options.plugins.title.text = curItemNameCN
    chart.data.datasets = [
      {
        label: '买入',
        data: data.bid.map(x => x.price),
        borderColor: '#ff3300',
        backgroundColor: '#ff3300',
        borderWidth: 1.5
      },
      {
        label: '卖出',
        data: data.ask.map(x => x.price),
        borderColor: '#00cc00',
        backgroundColor: '#00cc00',
        borderWidth: 1.5
      },
      {
        label: '均线',
        data: sma,
        borderColor: '#ff9900',
        borderWidth: 3,
        tension: 0.5,
        fill: true
      }
    ];
    chart.setDatasetVisibility(0, config.filter.ask);
    chart.setDatasetVisibility(1, config.filter.bid);
    chart.setDatasetVisibility(2, config.filter.mean);

    chart.update()
  }
  function save_config() {

    if (chart && chart.data && chart.data.datasets && chart.data.datasets.length == 3) {
      config.filter.ask = chart.getDatasetMeta(0).visible;
      config.filter.bid = chart.getDatasetMeta(1).visible;
      config.filter.mean = chart.getDatasetMeta(2).visible;
    }
    localStorage.setItem("mooket_config", JSON.stringify(config));
  }
  toggle();
})();