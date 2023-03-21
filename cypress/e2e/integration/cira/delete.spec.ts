/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as api from 'cypress/e2e/fixtures/api/cira'
import * as formEntry from 'cypress/e2e/fixtures/formEntry/cira'

describe('Test CIRA Config Deletion', () => {
  const allConfigs = [...formEntry.configs]
  let remainingConfigs = [...allConfigs]

  beforeEach(() => {
    cy.setup()
    api.interceptDelete(httpCodes.NO_CONTENT, null)
  })

  it('should not delete when cancelled', () => {
    api
      .interceptGetAll(httpCodes.SUCCESS, { data: allConfigs, totalCount: allConfigs.length })
      .as('api.GetAll')
    cy.goToPage('CIRA Configs')
    cy.wait('@api.GetAll')
    cy.get('mat-cell').contains('delete').click()
    cy.get('button').contains('No').click()
  })

  allConfigs.forEach((config) => {
    it(`should delete ${config.configName}`, () => {
      api
        .interceptGetAll(httpCodes.SUCCESS, { data: [...remainingConfigs], totalCount: remainingConfigs.length })
        .as('api.GetAll')
      cy.goToPage('CIRA Configs')
      cy.wait('@api.GetAll')
      remainingConfigs = remainingConfigs.filter(cfg => cfg.configName !== config.configName)
      api
        .interceptGetAll(httpCodes.SUCCESS, { data: [...remainingConfigs], totalCount: remainingConfigs.length })
        .as('api.GetAll')
      // Delete
      cy.get('mat-row').contains(config.configName).parent().contains('delete').click()
      cy.get('button').contains('Yes').click()
      cy.wait('@api.GetAll')
    })
  })
})
