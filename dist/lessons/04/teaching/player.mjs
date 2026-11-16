import data from'./lesson-data.mjs';import{renderScene,reportTrial}from'./visuals.mjs';import{mountInteractive}from'../../../assets/interactive-player.mjs';
mountInteractive({data,renderScene,reportTrial,audioUrl:new URL('./narration.m4a',import.meta.url).href});
