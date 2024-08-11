import Vuex from "vuex";
import datas from "~/assets/datas/datas.json";
import projects from "~/assets/datas/projects.json";
import index from "~/assets/datas/index.json";
import about from "~/assets/datas/about.json";
import contact from "~/assets/datas/contact.json";

if (process.browser) {
  var sniffer = require("sniffer");
}
export const state = () => ({
  datas,
  contact,
  about,
  index,
  projects,
  currentProject: 0,
  nextOffset: 0,
  path: "/images/",
  vPath: "/images/"
});
export const mutations = {
  SET_CURRENT_PROJECT(state, currentProject) {
    state.currentProject = currentProject;
  },
  SET_NEXT_OFFSET(state, nextOffset) {
    state.nextOffset = nextOffset;
  }
};
export const actions = {
  setCurrentProject({ commit }, currentProject) {
    commit("SET_CURRENT_PROJECT", currentProject);
  },
  setNextOffset({ commit }, nextOffset) {
    commit("SET_NEXT_OFFSET", nextOffset);
  }
};
export const getters = {
  isFF: () => {
    return sniffer ? sniffer.isFirefox : false;
  },
  project: state => {
    return state.projects.find(el => {
      return el.slug === state.route.params.slug;
    });
  },
  nextProject: (state, getters) => {
    return getters.projectId === state.projects.length - 1
      ? state.projects[0]
      : state.projects[getters.projectId + 1];
  },
  projectId: state => {
    let id = 0;
    state.projects.forEach((el, i) => {
      if (el.slug === state.route.params.slug) id = i;
    });
    return id;
  },
  nextProject: (state, getters) => {
    return getters.projectId < state.projects.length - 1
      ? state.projects[getters.projectId + 1]
      : state.projects[0];
  },
  isDevice: () => {
    return sniffer ? sniffer.isDevice : false;
  },
  isPhone: () => {
    return sniffer ? sniffer.isPhone : false;
  },
  isTablet: state => {
    return sniffer ? sniffer.isTablet : false;
  },
  isSafari: () => {
    return sniffer ? sniffer.isSafari : false;
  }
};
